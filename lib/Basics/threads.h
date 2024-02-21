////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2014-2023 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
////////////////////////////////////////////////////////////////////////////////

#pragma once

#include <cstdint>

#include "Basics/ErrorCode.h"
#include "Basics/operating-system.h"

////////////////////////////////////////////////////////////////////////////////
/// @brief posix threads
////////////////////////////////////////////////////////////////////////////////

#ifdef TRI_HAVE_POSIX_THREADS
#include "Basics/threads-posix.h"
#endif

////////////////////////////////////////////////////////////////////////////////
/// @brief initializes a thread
////////////////////////////////////////////////////////////////////////////////

void TRI_InitThread(TRI_thread_t*);

////////////////////////////////////////////////////////////////////////////////
/// @brief starts a thread
////////////////////////////////////////////////////////////////////////////////

bool TRI_StartThread(TRI_thread_t*, char const*, void (*starter)(void*),
                     void* data);

////////////////////////////////////////////////////////////////////////////////
/// @brief checks if we are the thread
////////////////////////////////////////////////////////////////////////////////

bool TRI_IsSelfThread(TRI_thread_t* thread);

////////////////////////////////////////////////////////////////////////////////
/// @brief sets the process affinity
////////////////////////////////////////////////////////////////////////////////

// SHOULD BE REMOVED
void TRI_InitThread(TRI_thread_t* thread);
ErrorCode TRI_JoinThread(TRI_thread_t* thread);
ErrorCode TRI_JoinThreadWithTimeout(TRI_thread_t* thread,
                                    std::uint32_t timeout);
bool TRI_DetachThread(TRI_thread_t* thread);
