//
//  TextInputView.h
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TextInputView : UIView

@property (nonatomic, strong) NSString *imageName;
@property (nonatomic) BOOL isSecure;

- (NSString *)getText;

@end
