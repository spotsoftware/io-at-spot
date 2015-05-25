//
//  LoginVC.m
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import "LoginVC.h"
#import "TextInputView.h"

@interface LoginVC ()

@property (weak, nonatomic) IBOutlet UIView *viewContainerUsername;
@property (weak, nonatomic) IBOutlet UIView *viewContainerPassword;
@property (weak, nonatomic) IBOutlet UIButton *btnSignIn;

@property (nonatomic, strong) IBOutlet TextInputView *txtUsername;
@property (nonatomic, strong) IBOutlet TextInputView *txtPassword;

@end

@implementation LoginVC

- (instancetype)init
{
    self = [super initWithNibName:@"LoginVC" bundle:nil];
    if (self) {
        
    }
    return self;
}

- (void)viewDidLoad{
    [super viewDidLoad];
    [self createTextViews];
}

- (void)createTextViews{
    self.txtUsername.imageName = @"ic_person_white_18dp.png";
    self.txtUsername.isSecure = NO;
    
    self.txtPassword.imageName = @"ic_lock_outline_white_18dp.png";
    self.txtPassword.isSecure = YES;
}

@end
