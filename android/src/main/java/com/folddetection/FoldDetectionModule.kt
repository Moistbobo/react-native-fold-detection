package com.folddetection

import com.facebook.react.bridge.ReactApplicationContext

class FoldDetectionModule(reactContext: ReactApplicationContext) :
  NativeFoldDetectionSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeFoldDetectionSpec.NAME
  }
}
