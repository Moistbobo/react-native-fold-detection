# react-native-fold-detection

The purpose of the package is to provide details regarding the Android folding capability.

## Installation

```sh
npm install @logicwind/react-native-fold-detection
```


## Requirements

This package is a Turbo Native Module and requires React Native 0.86 or newer with the New Architecture enabled. The legacy architecture is not supported.

## iOS

The module is autolinked on iOS and is a no-op. `useFoldingFeature` returns the default values and no events are emitted.

## In App.js Wrap your app with FoldingFeatureProvider

```js
import * as React from "react";

import { FoldingFeatureProvider } from "@logicwind/react-native-fold-detection";
import SampleScreen from "./SampleScreen";

export default function App() {
  return (
    <FoldingFeatureProvider>
      <SampleScreen />
    </FoldingFeatureProvider>
  );
}
```

## In other screens

```js
import { useFoldingFeature } from "@logicwind/react-native-fold-detection";

const { layoutInfo, isTableTop, isBook, isFlat } = useFoldingFeature();
```


### useFoldingFeature Props

| Prop       | Type       | Default | Description                                                                                                              |
| ---------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| layoutInfo | LayoutInfo |         | Folding Feature from [android doc](https://developer.android.com/reference/kotlin/androidx/window/layout/FoldingFeature) |
| isTableTop | boolean    | false   | HALF_OPENED & HORIZONTAL                                                                                                 |
| isBook     | boolean    | false   | HALF_OPENED & VERTICAL                                                                                                   |
| isFlat     | boolean    | true    |                                                                                                                          |
| hingeAngle | HingeAngleInfo | { supported: false, angle: null } | Live hinge angle in degrees (0..360) from `Sensor.TYPE_HINGE_ANGLE`. Android only.                                        |
| supportedPostures | SupportedPosture[] | [] | Postures the window layout supports, e.g. `TABLETOP`. Android only.                                                       |

`layoutInfo` also carries `displayFeatures`: the full `DisplayFeature[]` list from
`WindowLayoutInfo` (previously only the first feature was surfaced).

## Window metrics and size class

```js
import {
  useWindowMetrics,
  useWindowSizeClass,
  computeCurrentWindowMetrics,
  computeMaximumWindowMetrics,
  getWindowLayoutInfo,
  getSupportedPostures,
  getWindowSizeClass,
} from "@logicwind/react-native-fold-detection";

const { metrics } = useWindowMetrics();        // { bounds, density, widthDp, heightDp }
const { sizeClass } = useWindowSizeClass();    // { widthSizeClass, heightSizeClass, widthDp, heightDp }
```

| Export | Returns | Maps to |
| ------ | ------- | ------- |
| `useWindowMetrics(mode?)` | `{ metrics, error }` | `WindowMetricsCalculator.computeCurrentWindowMetrics` / `...MaximumWindowMetrics` |
| `useWindowSizeClass(breakpoints?)` | `{ sizeClass, error }` | `WindowSizeClass.BREAKPOINTS_V1/V2` (COMPACT / MEDIUM / EXPANDED) |
| `computeCurrentWindowMetrics()` | `Promise<WindowMetrics>` | `WindowMetricsCalculator.computeCurrentWindowMetrics` |
| `computeMaximumWindowMetrics()` | `Promise<WindowMetrics>` | `WindowMetricsCalculator.computeMaximumWindowMetrics` |
| `getWindowLayoutInfo()` | `Promise<WindowLayoutInfo>` | `WindowInfoTracker.getCurrentWindowLayoutInfo` (Window SDK extension >= 9) |
| `getSupportedPostures()` | `Promise<SupportedPosture[]>` | `WindowInfoTracker.supportedPostures` (Window SDK extension >= 6) |
| `getWindowSizeClass(breakpoints?)` | `Promise<WindowSizeClass>` | `WindowSizeClass.BREAKPOINTS_V1/V2.computeWindowSizeClass` |

`WindowMetrics` matches `androidx.window.layout.WindowMetrics` and does not include window insets.
Use your safe-area library for insets.

## react-native-fold-detection is crafted mindfully at [Logicwind](https://www.logicwind.com?utm_source=github&utm_medium=github.com-logicwind&utm_campaign=react-native-fold-detection)

We are a 130+ people company developing and designing multiplatform applications using the Lean & Agile methodology. To get more information on the solutions that would suit your needs, feel free to get in touch by [email](mailto:sales@logicwind.com) or through or [contact form](https://www.logicwind.com/contact-us?utm_source=github&utm_medium=github.com-logicwind&utm_campaign=react-native-fold-detection)!

We will always answer you with pleasure 😁

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details