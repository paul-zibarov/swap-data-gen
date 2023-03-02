import React, { useState } from 'react';
import { keccak256 } from 'ethers/lib/utils';
import { Contract, ethers } from 'ethers';

import erc20ABI from '../abi/erc20.json'
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

function Form() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

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
  const [hex, setHex] = useState('');

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

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
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(!ethers.utils.isAddress(formData.assetA) ||
      !ethers.utils.isAddress(formData.assetB) ||
      !ethers.utils.isAddress(formData.sender) ||
      !ethers.utils.isAddress(formData.router)
    ) { 
      console.error('Invalid addresses');
    } else {
      const amountBMin = (formData.amountB / (1 + formData.slippage)) * 100;
      const router = new Contract(formData.router, routerABI, provider);

      const hex = router.interface.encodeFunctionData('swapExactTokensForTokens', [
        ethers.utils.parseUnits(formData.amountA.toString(), 18),
        ethers.utils.parseUnits(amountBMin.toString(), 18),
        [formData.assetA, formData.assetB],
        formData.sender,
        '20000000000'
      ]);

      setHex(hex);
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
            <button type="submit">Generate tx data</button>
            <input
                type="text"
                id="field9"
                name="result"
                value={hex}
            />
        </form>
    </div>
  );
}

export default Form;