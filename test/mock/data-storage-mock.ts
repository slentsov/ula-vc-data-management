/*
 * Copyright 2019 Coöperatieve Rabobank U.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DataStorage } from '../../src'

export class DataStorageMock implements DataStorage {
  public async get (key: string): Promise<any> {
    return undefined
  }

  public async remove (key: string): Promise<void> {
    return undefined
  }

  public async set (key: string, value: any): Promise<void> {
    return undefined
  }
}
