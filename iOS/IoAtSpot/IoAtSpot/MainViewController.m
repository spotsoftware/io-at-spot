//
//  ViewController.m
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import "MainViewController.h"
#import "LoginVC.h"

@interface MainViewController ()

@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    LoginVC *loginVc = [[LoginVC alloc] init];
    [self.navigationController pushViewController:loginVc animated:NO];
}

@end
