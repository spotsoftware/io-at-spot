//
//  TextInputView.m
//  IoAtSpot
//
//  Created by Luca Giorgetti on 25/05/15.
//  Copyright (c) 2015 SPOT. All rights reserved.
//

#import "TextInputView.h"

@interface TextInputView ()

@property (strong, nonatomic) IBOutlet UIView *contentView;
@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UITextField *txtInput;

@end

@implementation TextInputView

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        [self loadNib:frame];
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder
{
    self = [super initWithCoder:coder];
    if (self) {
        [self loadNib:self.frame];
    }
    return self;
}

- (void)loadNib:(CGRect)frame
{
    NSBundle *mainBundle = [NSBundle mainBundle];
    
    [mainBundle loadNibNamed:@"TextInputView" owner:self options:nil];
    self.contentView.frame = CGRectMake(0.0, 0.0, frame.size.width, frame.size.height);
    
    [self addSubview:self.contentView];
}

- (void)setImageName:(NSString *)imageName{
    _imageName = imageName;
    self.imageView.image = [UIImage imageNamed:self.imageName];
}

- (void)setIsSecure:(BOOL)isSecure{
    _isSecure = isSecure;
    [self.txtInput setSecureTextEntry:self.isSecure];
    [[UITextView appearance] setTintColor:[UIColor blackColor]];
    [self.txtInput setTintColor:[UIColor whiteColor]];
    
}

- (NSString *)getText{
    return self.txtInput.text;
}

@end
