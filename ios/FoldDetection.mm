#import "FoldDetection.h"

@implementation FoldDetection

- (void)startListening
{
}

- (void)stopListening
{
}

- (void)computeCurrentWindowMetrics:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    resolve(@{
        @"bounds" : @{@"left" : @0, @"top" : @0, @"right" : @0, @"bottom" : @0},
        @"density" : @1,
        @"widthDp" : @0,
        @"heightDp" : @0
    });
}

- (void)computeMaximumWindowMetrics:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    resolve(@{
        @"bounds" : @{@"left" : @0, @"top" : @0, @"right" : @0, @"bottom" : @0},
        @"density" : @1,
        @"widthDp" : @0,
        @"heightDp" : @0
    });
}

- (void)getSupportedPostures:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
    resolve(@[]);
}

- (void)getWindowLayoutInfo:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
    resolve(@{@"displayFeatures" : @[]});
}

- (void)getWindowSizeClass:(NSString *)breakpoints
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
    resolve(@{
        @"widthSizeClass" : @"COMPACT",
        @"heightSizeClass" : @"COMPACT",
        @"widthDp" : @0,
        @"heightDp" : @0
    });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeFoldingFeatureSpecJSI>(params);
}

+ (NSString *)moduleName
{
    return @"FoldingFeature";
}

@end
