package com.folddetection

import android.app.Activity
import android.content.Context
import android.graphics.Rect
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import androidx.core.util.Consumer
import androidx.window.WindowSdkExtensions
import androidx.window.core.layout.WindowSizeClass
import androidx.window.core.layout.computeWindowSizeClass
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import androidx.window.layout.WindowMetrics
import androidx.window.layout.WindowMetricsCalculator
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.Executor

class FoldDetectionModule(reactContext: ReactApplicationContext) :
  NativeFoldingFeatureSpec(reactContext),
  LifecycleEventListener {
  private var windowInfoTracker: WindowInfoTrackerCallbackAdapter? = null
  private val layoutStateChangeCallback = LayoutStateChangeCallback()
  private val callbackExecutor: Executor = Executor { command ->
    Handler(Looper.getMainLooper()).post(command)
  }
  private var isListening = false
  private var lastWindowLayoutInfo: WindowLayoutInfo? = null

  private val sensorManager: SensorManager? =
    reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
  private val hingeAngleSensor: Sensor? =
    sensorManager?.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)

  private var isAngleListening = false
  private var lastHingeAngle: Double? = null

  private val hingeAngleListener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent) {
      val angle = event.values[0].toDouble()

      if (angle == lastHingeAngle) {
        return
      }

      lastHingeAngle = angle
      val eventMap: WritableMap = Arguments.createMap()
      eventMap.putBoolean("supported", true)
      eventMap.putDouble("angle", angle)
      emitOnHingeAngleChange(eventMap)
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
  }

  init {
    windowInfoTracker =
      WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(reactContext))
    reactContext.addLifecycleEventListener(this)
  }

  override fun startListening() {
    isListening = true
    bindToCurrentActivity()
    startAngleListening()
  }

  override fun stopListening() {
    isListening = false
    unregisterLayoutListener()
    stopAngleListening()
  }

  private fun bindToCurrentActivity() {
    val tracker = windowInfoTracker
    if (tracker == null) {
      sendErrorEvent("This device does not support window layout info")
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      sendErrorEvent("Activity is null in startListening")
      return
    }

    try {
      // Remove first, then add, so the listener rebinds to the current Activity.
      // WindowInfoTrackerCallbackAdapter dedupes by callback identity, so adding
      // without removing would be a no-op and keep the old Activity registered.
      tracker.removeWindowLayoutInfoListener(layoutStateChangeCallback)
      tracker.addWindowLayoutInfoListener(activity, callbackExecutor, layoutStateChangeCallback)
    } catch (e: Exception) {
      sendErrorEvent("Error On startListening")
    }
  }

  private fun unregisterLayoutListener() {
    try {
      windowInfoTracker?.removeWindowLayoutInfoListener(layoutStateChangeCallback)
    } catch (e: Exception) {
      sendErrorEvent("Error On stopListening")
    }
  }

  private fun startAngleListening() {
    if (isAngleListening) {
      return
    }

    val sensor = hingeAngleSensor
    if (sensor == null) {
      isAngleListening = true
      lastHingeAngle = null
      val event: WritableMap = Arguments.createMap()
      event.putBoolean("supported", false)
      event.putNull("angle")
      emitOnHingeAngleChange(event)
      return
    }

    isAngleListening = true
    sensorManager?.registerListener(hingeAngleListener, sensor, SensorManager.SENSOR_DELAY_UI)
  }

  private fun stopAngleListening() {
    isAngleListening = false
    sensorManager?.unregisterListener(hingeAngleListener)
  }

  override fun onHostResume() {
    if (isListening) {
      bindToCurrentActivity()
      startAngleListening()
    }
  }

  override fun onHostPause() {
    unregisterLayoutListener()
    stopAngleListening()
  }

  override fun onHostDestroy() {
    unregisterLayoutListener()
    stopAngleListening()
  }

  override fun invalidate() {
    unregisterLayoutListener()
    stopAngleListening()
    reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  override fun computeCurrentWindowMetrics(promise: Promise) {
    resolveWindowMetrics(promise) {
      WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(it)
    }
  }

  override fun computeMaximumWindowMetrics(promise: Promise) {
    resolveWindowMetrics(promise) {
      WindowMetricsCalculator.getOrCreate().computeMaximumWindowMetrics(it)
    }
  }

  override fun getSupportedPostures(promise: Promise) {
    try {
      if (WindowSdkExtensions.getInstance().extensionVersion < 6) {
        promise.resolve(Arguments.createArray())
        return
      }

      val postures = Arguments.createArray()
      val tracker = WindowInfoTracker.getOrCreate(reactApplicationContext)
      for (posture in tracker.supportedPostures) {
        postures.pushString(posture.toString())
      }
      promise.resolve(postures)
    } catch (e: Exception) {
      promise.reject("E_SUPPORTED_POSTURES", e.message ?: "Failed to read supported postures", e)
    }
  }

  override fun getWindowLayoutInfo(promise: Promise) {
    try {
      val activity = reactApplicationContext.currentActivity
      if (WindowSdkExtensions.getInstance().extensionVersion >= 9 && activity != null) {
        val tracker = WindowInfoTracker.getOrCreate(reactApplicationContext)
        promise.resolve(buildLayoutInfo(tracker.getCurrentWindowLayoutInfo(activity)))
        return
      }

      val cached = lastWindowLayoutInfo
      val layoutInfo = if (cached != null) {
        buildLayoutInfo(cached)
      } else {
        buildLayoutInfo(WindowLayoutInfo(emptyList()))
      }
      promise.resolve(layoutInfo)
    } catch (e: Exception) {
      promise.reject("E_WINDOW_LAYOUT_INFO", e.message ?: "Failed to read window layout info", e)
    }
  }

  override fun getWindowSizeClass(breakpoints: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No current Activity")
      return
    }

    try {
      val metrics = WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(activity)
      val breakpointSet = if (breakpoints == "V2") {
        WindowSizeClass.BREAKPOINTS_V2
      } else {
        WindowSizeClass.BREAKPOINTS_V1
      }
      val sizeClass = breakpointSet.computeWindowSizeClass(metrics.widthDp, metrics.heightDp)

      val result = Arguments.createMap()
      result.putString("widthSizeClass", widthSizeClassOf(sizeClass))
      result.putString("heightSizeClass", heightSizeClassOf(sizeClass))
      result.putDouble("widthDp", metrics.widthDp.toDouble())
      result.putDouble("heightDp", metrics.heightDp.toDouble())
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("E_WINDOW_SIZE_CLASS", e.message ?: "Failed to compute window size class", e)
    }
  }

  private fun resolveWindowMetrics(promise: Promise, compute: (Activity) -> WindowMetrics) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No current Activity")
      return
    }

    try {
      promise.resolve(metricsToWritableMap(compute(activity)))
    } catch (e: Exception) {
      promise.reject("E_WINDOW_METRICS", e.message ?: "Failed to compute window metrics", e)
    }
  }

  private fun widthSizeClassOf(sizeClass: WindowSizeClass): String = when {
    sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND) -> "EXPANDED"
    sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND) -> "MEDIUM"
    else -> "COMPACT"
  }

  private fun heightSizeClassOf(sizeClass: WindowSizeClass): String = when {
    sizeClass.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_EXPANDED_LOWER_BOUND) -> "EXPANDED"
    sizeClass.isHeightAtLeastBreakpoint(WindowSizeClass.HEIGHT_DP_MEDIUM_LOWER_BOUND) -> "MEDIUM"
    else -> "COMPACT"
  }

  private fun metricsToWritableMap(metrics: WindowMetrics): WritableMap {
    val map = Arguments.createMap()
    map.putMap("bounds", rectToWritableMap(metrics.bounds))
    map.putDouble("density", metrics.density.toDouble())
    map.putDouble("widthDp", metrics.widthDp.toDouble())
    map.putDouble("heightDp", metrics.heightDp.toDouble())
    return map
  }

  private fun rectToWritableMap(rect: Rect): WritableMap {
    val map = Arguments.createMap()
    map.putInt("left", rect.left)
    map.putInt("top", rect.top)
    map.putInt("right", rect.right)
    map.putInt("bottom", rect.bottom)
    return map
  }

  private fun buildLayoutInfo(value: WindowLayoutInfo): WritableMap {
    val displayFeatures = Arguments.createArray()
    for (feature in value.displayFeatures) {
      if (feature is FoldingFeature) {
        displayFeatures.pushMap(foldingFeatureToWritableMap(feature))
      }
    }

    val map = Arguments.createMap()
    map.putArray("displayFeatures", displayFeatures)
    return map
  }

  private fun foldingFeatureToWritableMap(feature: FoldingFeature): WritableMap {
    val map = Arguments.createMap()
    map.putString("type", "FOLDING")
    map.putMap("bounds", rectToWritableMap(feature.bounds))
    map.putString("state", feature.state.toString())
    map.putString("orientation", feature.orientation.toString())
    map.putString("occlusionType", feature.occlusionType.toString())
    map.putBoolean("isSeparating", feature.isSeparating)
    return map
  }

  inner class LayoutStateChangeCallback : Consumer<WindowLayoutInfo> {
    override fun accept(value: WindowLayoutInfo) {
      lastWindowLayoutInfo = value
      try {
        emitOnLayoutInfoChange(buildLayoutInfo(value))
      } catch (e: Exception) {
        sendErrorEvent("Error parsing displayFeatures")
      }
    }
  }

  private fun sendErrorEvent(errorMessage: String) {
    val event: WritableMap = Arguments.createMap()
    event.putString("error", errorMessage)
    emitOnError(event)
  }

  companion object {
    const val NAME = NativeFoldingFeatureSpec.NAME
  }
}
