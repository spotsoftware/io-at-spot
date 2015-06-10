//
//  LoginVC.m
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import "LoginVC.h"
#import "HomeVC.h"
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
    [self.btnSignIn addTarget:self action:@selector(login) forControlEvents:UIControlEventTouchDown];
}

- (void)createTextViews{
    self.txtUsername.imageName = @"ic_person_white_18dp.png";
    self.txtUsername.isSecure = NO;
    
    self.txtPassword.imageName = @"ic_lock_outline_white_18dp.png";
    self.txtPassword.isSecure = YES;
}

- (void)login{
    
    NSString *email = self.txtUsername.getText;
    NSString *password = self.txtPassword.getText;
    
    dispatch_queue_t queue = dispatch_queue_create("it.spot.login", NULL);
    dispatch_async(queue, ^{
        //code to be executed in the background
        NSURL *url = [NSURL URLWithString:@"http://io.spot.it/auth/local"];
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
        
        NSString *requestFields = @"";
        requestFields = [requestFields stringByAppendingFormat:@"email=%@&", email];
        requestFields = [requestFields stringByAppendingFormat:@"password=%@&", password];
        
        requestFields = [requestFields stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        NSData *requestData = [requestFields dataUsingEncoding:NSUTF8StringEncoding];
        request.HTTPBody = requestData;
        request.HTTPMethod = @"POST";
        
        NSHTTPURLResponse *response = nil;
        NSError *error = nil;
        NSData *responseData = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&error];
        if (error == nil && response.statusCode == 200) {
            NSLog(@"%li", (long)response.statusCode);
        } else {
            //Error handling
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
            //code to be executed on the main thread when background task is finished
            NSLog(@"va tutto %@", responseData);
            
            NSError* error;
            NSDictionary* json = [NSJSONSerialization JSONObjectWithData:responseData
                                                                 options:kNilOptions
                                                                   error:&error];
            
            NSNumber *status = [json objectForKey:@"status"];
            if(404 == status.intValue){
                NSLog(@"Error: %@", [json objectForKey:@"message"]);
            } else {
                NSString *userToken = [json objectForKey:@"token"];
                
                // Store the token
                NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
                [defaults setObject:userToken forKey:@"authToken"];
                [defaults synchronize];
                
                NSLog(@"Token %@ saved in user defaults", userToken);
                
                HomeVC *homeVc = [[HomeVC alloc] init];
                [self.navigationController pushViewController:homeVc animated:NO];
            }
        });
    });
}

@end
