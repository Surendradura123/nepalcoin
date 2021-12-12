import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';
import NavbarComp from './NavbarComp';
import logo from '../assets/nepalcoin.png';

class ConductTransaction extends Component {
    state = { recipient: '', amount: 0 };


    updateRecipient = event => {
        this.setState({ recipient: event.target.value });
    }
    
    updateAmount = event => {
        this.setState({ amount: Number(event.target.value) });
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ recipient, amount})
        }).then((response) => response.json())
          .then(json => {
              alert(json.message || json.type);
              history.push('/transaction-pool');
          });
    }

    render() {
        return(
            <div className='ConductTransaction'>
                <NavbarComp />
                <img className="logo" src={logo}></img>
                <br/>
                <h3>Conduct a Transaction</h3>
                <FormGroup>
                    <FormControl 
                        input='text' 
                        placeholder='recipient' 
                        defaultValue={this.state.recipient}
                        onChange={this.updateRecipent}
                    />
                </FormGroup>
                <br/>
                <FormGroup>
                    <FormControl
                        input='number'
                        placeholder='amount'
                        defaultValue={this.state.amount}
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <br />
                <div>
                    <Button variant="danger"  onClick={this.conductTransaction}>
                        Submit 
                    </Button>
                </div>
            </div>
        )
    }
};

export default ConductTransaction;