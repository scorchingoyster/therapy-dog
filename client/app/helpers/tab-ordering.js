// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import Ember from 'ember';

export function tabOrdering(params) {
  let indexer = params.slice(0, 2);
  let checker = params[2];

  if (checker) {
    return indexer.reduce((a, b) => {
      return a + b;
    });
  } else {
    return indexer[0];
  }
};

export default Ember.Helper.helper(tabOrdering);
