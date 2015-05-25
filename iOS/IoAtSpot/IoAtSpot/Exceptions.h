//
//  Exceptions.h
//  MyRunApp
//
//  Created by Lorenzo Brasini on 03/09/14.
//  Copyright (c) 2014 Technogym. All rights reserved.
//

#define NotImplementedException [NSException exceptionWithName:NSInternalInconsistencyException reason:[NSString stringWithFormat:@"You must override %@ in a subclass", NSStringFromSelector(_cmd)] userInfo:nil];

#define DefaultUserInvalidOperationException [NSException exceptionWithName:NSGenericException reason:[NSString stringWithFormat:@"Can't set %@ for default user", NSStringFromSelector(_cmd)] userInfo:nil];
