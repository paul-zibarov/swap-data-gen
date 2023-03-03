import React, { useState } from 'react';
import { Contract, ethers } from 'ethers';

import routerABI from '../abi/router.json'
import "./Form.css";

interface FormData {
  assetA: string;
  assetB: string;
  amountA: number;
  amountB: number;
  slippage: number;
  sender: string;
  router: string;
  gasPrice: number;
}

enum HexStatus {
  Default = "default",
  Changed = "changed",
  Error = "error"
}

function Form() {
  const [formData, setFormData] = useState<FormData>({
    assetA: '',
    assetB: '',
    amountA: 0,
    amountB: 0,
    slippage: 0,
    sender: '',
    router: '',
    gasPrice: 5
  });

  const [hexStatus, setHexStatus] = useState(HexStatus.Default);
  const [hex, setHex] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setErrorMessage("");

    if(name === 'slippage' || name === 'amountA' || name === 'amountB') {
      if(!value || value.match(/^\d{1,}(\.\d{0,4})?$/)) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }))
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      setHexStatus(HexStatus.Default);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(!ethers.utils.isAddress(formData.assetA) ||
      !ethers.utils.isAddress(formData.assetB) ||
      !ethers.utils.isAddress(formData.sender) ||
      !ethers.utils.isAddress(formData.router)
    ) {
      setErrorMessage("Invalid addresses");
      setHexStatus(HexStatus.Error);
    } else {
      const amountBMin = (formData.amountB / (1 + formData.slippage)) * 100;
      const router = new Contract(formData.router, routerABI);

      const hex = router.interface.encodeFunctionData('swapExactTokensForTokens', [
        ethers.utils.parseUnits(formData.amountA.toString(), 18),
        ethers.utils.parseUnits(amountBMin.toString(), 18),
        [formData.assetA, formData.assetB],
        formData.sender,
        '20000000000'
      ]);

      setHex(hex);
      setHexStatus(HexStatus.Changed);
    }
  };

  return (
    <div className='container'>
        <form className='form' onSubmit={handleSubmit}>
            <h2>Swap Exact Tokens For Tokens</h2>
            <div>
            <label htmlFor="field1">Asset A:</label>
            <input
                type="text"
                id="field1"
                name="assetA"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field2">Asset B:</label>
            <input
                type="text"
                id="field2"
                name="assetB"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field3">Input amount:</label>
            <input
                type="text"
                id="field3"
                name="amountA"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field4">Output amount:</label>
            <input
                type="text"
                id="field4"
                name="amountB"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field5">Slippage %:</label>
            <input
                type="text"
                id="field5"
                name="slippage"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field6">Router:</label>
            <input
                type="text"
                id="field6"
                name="router"
                onChange={handleFormChange}
            />
            </div>
            <div>
            <label htmlFor="field7">Sender:</label>
            <input
                type="text"
                id="field7"
                name="sender"
                onChange={handleFormChange}
            />
            </div>
            <button id="button" type="submit">Generate tx data</button>
            { (errorMessage) ? <div id="error">{errorMessage}</div> : null }
            <div id="data" className={hexStatus}>{hex}</div>
        </form>
    </div>
  );
}

export default Form;