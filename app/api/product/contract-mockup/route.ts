// DEV-ONLY DEMO ROUTE — delete before opening the PR.
// This stands in for the real backend so the product page's IDE mockup
// renders with data on localhost.
import { NextResponse } from 'next/server';
import type { ContractSnippet } from '@/types/contractMockup';

const fixture: ContractSnippet = {
  fileName: 'EscrowVault.sol',
  language: 'solidity',
  code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SwiftChain Escrow Vault
/// @notice Locks shipment funds until delivery is confirmed on-chain.
contract EscrowVault {
    enum Status { Pending, Locked, Released, Disputed }

    struct Escrow {
        address payer;
        address payee;
        uint256 amount;
        Status status;
    }

    mapping(bytes32 => Escrow) public escrows;

    event FundsLocked(bytes32 indexed escrowId, uint256 amount);
    event FundsReleased(bytes32 indexed escrowId, address indexed payee);

    function lockFunds(bytes32 escrowId, address payee) external payable {
        require(msg.value > 0, "Amount must be greater than zero");
        require(escrows[escrowId].status == Status.Pending, "Escrow already exists");

        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            status: Status.Locked
        });

        emit FundsLocked(escrowId, msg.value);
    }

    function releaseFunds(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == Status.Locked, "Escrow not locked");
        require(msg.sender == escrow.payer, "Only payer can release");

        escrow.status = Status.Released;
        payable(escrow.payee).transfer(escrow.amount);

        emit FundsReleased(escrowId, escrow.payee);
    }
}
`,
};

export async function GET() {
  return NextResponse.json(fixture);
}
