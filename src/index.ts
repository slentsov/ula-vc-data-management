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

/*export { File } from './File';*/

export { DataStorage } from './interface/data-storage'

export { VCRepository } from './interface/vc-repository'

export { VCTransactionRepository } from './interface/vc-transaction-repository'

export { VerifiableCredentialRepository } from './repository/verifiable-credential-repository'

export { VerifiableCredentialTransactionRepository } from './repository/verifiable-credential-transaction-repository'

export { AddressRepository } from './repository/address-repository'

export { Address, IAddress } from './model/address'

export { VcTransaction, IVcTransaction } from './model/vc-transaction'

export { VcDataManagement } from './vc-data-mgmt'
