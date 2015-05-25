//
//  UIViewController+AutoLayout.h
//  MyRunApp
//
//  Created by Lorenzo Brasini on 20/06/14.
//  Copyright (c) 2014 Technogym. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIViewController (AutoLayout)

- (NSArray *)constraintAlignmentFor:(UIView *)subject to:(UIView *)to;

- (NSDictionary *)displayContentController:(UIViewController*)contentViewController
                               toContainer:(UIView *)containerView
                               withMargins:(NSArray *)margins;

- (void)hideContentController:(UIViewController *)contentViewController;

#pragma mark - Constraints patterns

- (NSDictionary *)constraintView:(UIView *)contentView
                        toParent:(UIView *)containerView
                     withMargins:(NSArray *)margins;

@end
