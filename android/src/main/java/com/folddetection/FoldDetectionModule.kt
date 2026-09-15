package com.folddetection

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
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
    val packageManager = reactContext.packageManager
    if (packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)) {
      windowInfoTracker =
        WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(reactContext))
    }
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

  inner class LayoutStateChangeCallback : Consumer<WindowLayoutInfo> {
    override fun accept(value: WindowLayoutInfo) {
      try {
        val displayFeaturesList = value.displayFeatures
        val packageManager = reactApplicationContext.packageManager
        val featureSupported =
          packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)

        if (displayFeaturesList.isNotEmpty()) {
          val feature = displayFeaturesList[0] // Assuming there's only one feature

          if (feature is FoldingFeature) {
            val featureObject = Arguments.createMap()
            featureObject.putString("state", feature.state.toString())
            featureObject.putString("orientation", feature.orientation.toString())
            featureObject.putBoolean("isSeparating", feature.isSeparating)
            featureObject.putString("occlusionType", feature.occlusionType.toString())
            featureObject.putBoolean("isFoldSupported", featureSupported)

            // Parse and include detailed bounds information
            val bounds = parseBoundsString(feature.bounds.toString())
            featureObject.putMap("bounds", bounds)

            emitOnLayoutInfoChange(featureObject)
          }
        }
      } catch (e: Exception) {
        sendErrorEvent("Error parsing displayFeatures")
      }
    }

    private fun parseBoundsString(boundsString: String): WritableMap {
      val bounds = Arguments.createMap()
      val regex = Regex(".*\\((\\d+), (\\d+) - (\\d+), (\\d+)\\)")
      val matchResult = regex.find(boundsString)

      if (matchResult != null && matchResult.groupValues.size == 5) {
        val left = matchResult.groupValues[1].toInt()
        val top = matchResult.groupValues[2].toInt()
        val right = matchResult.groupValues[3].toInt()
        val bottom = matchResult.groupValues[4].toInt()

        bounds.putInt("left", left)
        bounds.putInt("top", top)
        bounds.putInt("right", right)
        bounds.putInt("bottom", bottom)
      }

      return bounds
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
