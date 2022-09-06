import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
    RipProtocolERC20Token,
    RipProtocolERC20Token__factory,
    RipProtocolAuthority__factory,
} from "../../types";

describe("RipProtocolTest", () => {
    let deployer: SignerWithAddress;
    let vault: SignerWithAddress;
    let bob: SignerWithAddress;
    let alice: SignerWithAddress;
    let rip: RipProtocolERC20Token;

    beforeEach(async () => {
        [deployer, vault, bob, alice] = await ethers.getSigners();

        const authority = await new RipProtocolAuthority__factory(deployer).deploy(
            deployer.address,
            deployer.address,
            deployer.address,
            vault.address
        );
        await authority.deployed();

        rip = await new RipProtocolERC20Token__factory(deployer).deploy(authority.address);
    });

    it("correctly constructs an ERC20", async () => {
        expect(await rip.name()).to.equal("r.rip");
        expect(await rip.symbol()).to.equal("R.RIP");
        expect(await rip.decimals()).to.equal(9);
    });

    describe("mint", () => {
        it("must be done by vault", async () => {
            await expect(rip.connect(deployer).mint(bob.address, 100)).to.be.revertedWith(
                "UNAUTHORIZED"
            );
        });

        it("increases total supply", async () => {
            const supplyBefore = await rip.totalSupply();
            await rip.connect(vault).mint(bob.address, 100);
            expect(supplyBefore.add(100)).to.equal(await rip.totalSupply());
        });
    });

    describe("burn", () => {
        beforeEach(async () => {
            await rip.connect(vault).mint(bob.address, 100);
        });

        it("reduces the total supply", async () => {
            const supplyBefore = await rip.totalSupply();
            await rip.connect(bob).burn(10);
            expect(supplyBefore.sub(10)).to.equal(await rip.totalSupply());
        });

        it("cannot exceed total supply", async () => {
            const supply = await rip.totalSupply();
            await expect(rip.connect(bob).burn(supply.add(1))).to.be.revertedWith(
                "ERC20: burn amount exceeds balance"
            );
        });

        it("cannot exceed bob's balance", async () => {
            await rip.connect(vault).mint(alice.address, 15);
            await expect(rip.connect(alice).burn(16)).to.be.revertedWith(
                "ERC20: burn amount exceeds balance"
            );
        });
    });
});
