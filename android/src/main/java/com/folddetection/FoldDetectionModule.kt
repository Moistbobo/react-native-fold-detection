package com.folddetection

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import java.util.concurrent.Executors

class FoldDetectionModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext),
  LifecycleEventListener {
  private var windowInfoTracker: WindowInfoTrackerCallbackAdapter? = null
  private val layoutStateChangeCallback = LayoutStateChangeCallback()

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
      sendEvent(reactApplicationContext, "onHingeAngleChange", eventMap)
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
  }

  init {
    val packageManager = reactContext.packageManager
    if (packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)) {
      windowInfoTracker =
        WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(reactContext))
    }
    reactApplicationContext.addLifecycleEventListener(this)
  }

  override fun getName(): String {
    return "FoldingFeature"
  }

  @ReactMethod
  fun startListening() {
    val activity = currentActivity
    try {
      if (activity != null && windowInfoTracker != null) {
        windowInfoTracker!!.addWindowLayoutInfoListener(
          activity,
          Executors.newSingleThreadExecutor(),
          layoutStateChangeCallback
        )
      } else {
        sendErrorEvent("Activity is null or device does not support fold feature in startListening")
      }
    } catch (e: Exception) {
      sendErrorEvent("Error On startListening")
    }
    startAngleListening()
  }

  @ReactMethod
  fun stopListening() {
    try {
      if (windowInfoTracker != null) {
        windowInfoTracker!!.removeWindowLayoutInfoListener(layoutStateChangeCallback)
      }
    } catch (e: Exception) {
      sendErrorEvent("Error On stopListening")
    }
    stopAngleListening()
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
      sendEvent(reactApplicationContext, "onHingeAngleChange", event)
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
    if (isAngleListening) {
      val sensor = hingeAngleSensor ?: return
      sensorManager?.registerListener(hingeAngleListener, sensor, SensorManager.SENSOR_DELAY_UI)
    }
  }

  override fun onHostPause() {
    sensorManager?.unregisterListener(hingeAngleListener)
  }

  override fun onHostDestroy() {
    isAngleListening = false
    sensorManager?.unregisterListener(hingeAngleListener)
  }

  inner class LayoutStateChangeCallback : Consumer<WindowLayoutInfo> {
    override fun accept(newLayoutInfo: WindowLayoutInfo) {
      val event: WritableMap = Arguments.createMap()

      try {
        val displayFeaturesList = newLayoutInfo.displayFeatures
        val packageManager = reactApplicationContext.packageManager
        val featureSupported =
          packageManager.hasSystemFeature(PackageManager.FEATURE_SENSOR_HINGE_ANGLE)

        if (displayFeaturesList.isNotEmpty()) {
          val feature = displayFeaturesList[0] // Assuming there's only one feature

          val featureObject = Arguments.createMap()

          if (feature is FoldingFeature) {
            val foldingFeature = feature as FoldingFeature
            featureObject.putString("state", foldingFeature.state.toString())
            featureObject.putString("orientation", foldingFeature.orientation.toString())
            featureObject.putBoolean("isSeparating", foldingFeature.isSeparating)
            featureObject.putString("occlusionType", foldingFeature.occlusionType.toString())
            featureObject.putBoolean("isFoldSupported", featureSupported)

            // Parse and include detailed bounds information
            val bounds = parseBoundsString(foldingFeature.bounds.toString())
            featureObject.putMap("bounds", bounds)
          }

          event.putMap("displayFeatures", featureObject)
        }
      } catch (e: Exception) {
        event.putString("displayFeatures", "Error parsing displayFeatures")
      }

      sendEvent(reactApplicationContext, "onLayoutInfoChange", event)
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

  private fun sendEvent(
    reactContext: ReactApplicationContext,
    eventName: String,
    params: WritableMap
  ) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun sendErrorEvent(errorMessage: String) {
    val event: WritableMap = Arguments.createMap()
    event.putString("error", errorMessage)
    sendEvent(reactApplicationContext, "onError", event)
  }
}
