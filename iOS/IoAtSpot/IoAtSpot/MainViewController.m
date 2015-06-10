//
//  ViewController.m
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import "MainViewController.h"
#import "LoginVC.h"
#import "HomeVC.h"

@interface MainViewController ()

@end

@implementation MainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *authToken = [defaults valueForKey:@"authToken"];
    if(authToken && authToken.length > 0){
        HomeVC *homeVc = [[HomeVC alloc] init];
        [self.navigationController pushViewController:homeVc animated:NO];
    } else {
        LoginVC *loginVc = [[LoginVC alloc] init];
        [self.navigationController pushViewController:loginVc animated:NO];
    }
}

@end
