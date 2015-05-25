//
//  UIViewController+AutoLayout.m
//  MyRunApp
//
//  Created by Lorenzo Brasini on 20/06/14.
//  Copyright (c) 2014 Technogym. All rights reserved.
//

#import "UIViewController+AutoLayout.h"

NSString * const TopKey = @"kTopKey";
NSString * const RightKey = @"kRightKey";
NSString * const BottomKey = @"kBottomKey";
NSString * const LeftKey = @"kLeftKey";

@implementation UIViewController (AutoLayout)

- (NSArray *)constraintAlignmentFor:(UIView *)subject to:(UIView *)to
{
    NSMutableArray *constraints = [[NSMutableArray alloc] init];
    [constraints addObject:[NSLayoutConstraint constraintWithItem:subject
                                                        attribute:NSLayoutAttributeTop
                                                        relatedBy:NSLayoutRelationEqual
                                                           toItem:to
                                                        attribute:NSLayoutAttributeTop
                                                       multiplier:1.f
                                                         constant:0]];
    [constraints addObject:[NSLayoutConstraint constraintWithItem:subject
                                                        attribute:NSLayoutAttributeLeft
                                                        relatedBy:NSLayoutRelationEqual
                                                           toItem:to
                                                        attribute:NSLayoutAttributeLeft
                                                       multiplier:1.f
                                                         constant:0]];
    [constraints addObject:[NSLayoutConstraint constraintWithItem:subject
                                                        attribute:NSLayoutAttributeRight
                                                        relatedBy:NSLayoutRelationEqual
                                                           toItem:to
                                                        attribute:NSLayoutAttributeRight
                                                       multiplier:1.f
                                                         constant:0]];
    [constraints addObject:[NSLayoutConstraint constraintWithItem:subject
                                                        attribute:NSLayoutAttributeBottom
                                                        relatedBy:NSLayoutRelationEqual
                                                           toItem:to
                                                        attribute:NSLayoutAttributeBottom
                                                       multiplier:1.f
                                                         constant:0]];
    
    for (NSLayoutConstraint *constraint in constraints) {
        [self.view addConstraint:constraint];
    }
    
    return constraints;
}

- (NSDictionary *)displayContentController:(UIViewController*)contentViewController
                               toContainer:(UIView *)containerView
                               withMargins:(NSArray *)margins
{
    // 1: It calls the container’s addChildViewController: method to add the child.
    //    Calling the addChildViewController: method also calls the child’s willMoveToParentViewController: method
    //    automatically.
    [self addChildViewController:contentViewController];
    // 2: Syncs the frames between the container and the content.
    contentViewController.view.frame = containerView.frame;
    
    NSDictionary *constraints = [self constraintView:contentViewController.view
                                            toParent:containerView
                                         withMargins:margins];
    // 5: It explicitly calls the child’s didMoveToParentViewController: method to signal that the operation
    //    is complete.
    [contentViewController didMoveToParentViewController:self];
    
    return constraints;
}

- (void)hideContentController:(UIViewController *)contentViewController
{
    // 1: Calls the child’s willMoveToParentViewController: method with a parameter of nil to tell the child
    //    that it is being removed.
    [contentViewController willMoveToParentViewController:nil];
    // 2: Cleans up the view hierarchy.
    //    INF: There is no need to explicitly remove constraints applying to a view that you are removing
    //    from the view hierarchy. Constraints will be removed automatically when removing that view.
    [contentViewController.view removeFromSuperview];
    
    // TODO: Hotfix, this lines should be removed, but somehow they aren't called automatically ....
    [contentViewController viewWillDisappear:NO];
    [contentViewController viewDidDisappear:NO];
    
    // 3: Calls the child’s removeFromParentViewController method to remove it from the container.
    //    Calling the removeFromParentViewController method automatically calls the child’s
    //    didMoveToParentViewController: method.
    [contentViewController removeFromParentViewController];
}

#pragma mark - Constraints patterns

- (NSDictionary *)constraintView:(UIView *)contentView toParent:(UIView *)containerView withMargins:(NSArray *)margins
{
    assert(margins.count <= 4);
    
    NSDictionary *constraints = @{
                                  TopKey: [NSLayoutConstraint constraintWithItem:contentView
                                                                       attribute:NSLayoutAttributeTop
                                                                       relatedBy:NSLayoutRelationEqual
                                                                          toItem:containerView
                                                                       attribute:NSLayoutAttributeTop
                                                                      multiplier:1.f
                                                                        constant:margins.count > 0 ? [margins[0] integerValue] : 0],
                                  RightKey: [NSLayoutConstraint constraintWithItem:contentView
                                                                         attribute:NSLayoutAttributeRight
                                                                         relatedBy:NSLayoutRelationEqual
                                                                            toItem:containerView
                                                                         attribute:NSLayoutAttributeRight
                                                                        multiplier:1.f
                                                                          constant:margins.count > 1 ? -[margins[1] integerValue] : 0],
                                  BottomKey: [NSLayoutConstraint constraintWithItem:contentView
                                                                          attribute:NSLayoutAttributeBottom
                                                                          relatedBy:NSLayoutRelationEqual
                                                                             toItem:containerView
                                                                          attribute:NSLayoutAttributeBottom
                                                                         multiplier:1.f
                                                                           constant:margins.count > 2 ? -[margins[2] integerValue] : 0],
                                  LeftKey: [NSLayoutConstraint constraintWithItem:contentView
                                                                        attribute:NSLayoutAttributeLeft
                                                                        relatedBy:NSLayoutRelationEqual
                                                                           toItem:containerView
                                                                        attribute:NSLayoutAttributeLeft
                                                                       multiplier:1.f
                                                                         constant:margins.count > 3 ? [margins[3] integerValue] : 0] };
    
    @try {
        // 3: Adds it to its own view hierarchy.
        [containerView addSubview:contentView];
        // 4: Sets the constraints between the container and the content.
        contentView.translatesAutoresizingMaskIntoConstraints = NO;
        
        [containerView addConstraint:[constraints objectForKey:BottomKey]];
        [containerView addConstraint:[constraints objectForKey:TopKey]];
        [containerView addConstraint:[constraints objectForKey:RightKey]];
        [containerView addConstraint:[constraints objectForKey:LeftKey]];
    }
    @catch (NSException *exception) {
    }
    
    
    return constraints;
}

@end
