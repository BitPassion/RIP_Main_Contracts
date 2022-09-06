import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MockSRIP__factory, MockSRIP } from "../../types";

describe("Mock sRip Tests", () => {
    // 100 sRIP
    const INITIAL_AMOUNT = "100000000000";

    let initializer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let sRip: MockSRIP;

    beforeEach(async () => {
        [initializer, alice, bob] = await ethers.getSigners();

        // Initialize to index of 1 and rebase percentage of 1%
        sRip = await new MockSRIP__factory(initializer).deploy("1000000000", "10000000");

        // Mint 100 sRIP for intializer account
        await sRip.mint(initializer.address, INITIAL_AMOUNT);
    });

    it("should rebase properly", async () => {
        expect(await sRip.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("100000000000");
        expect(await sRip.index()).to.equal("1000000000");

        await sRip.rebase();
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("100000000000");
        expect(await sRip.balanceOf(initializer.address)).to.equal("101000000000");
        expect(await sRip.index()).to.equal("1010000000");
    });

    it("should transfer properly", async () => {
        expect(await sRip.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("100000000000");

        //await sRip.approve(bob.address, INITIAL_AMOUNT);
        await sRip.transfer(bob.address, INITIAL_AMOUNT);

        expect(await sRip.balanceOf(initializer.address)).to.equal("0");
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("0");

        expect(await sRip.balanceOf(bob.address)).to.equal(INITIAL_AMOUNT);
        expect(await sRip._agnosticBalance(bob.address)).to.equal("100000000000");
    });

    it("should transfer properly after rebase", async () => {
        const afterRebase = "101000000000";

        expect(await sRip.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("100000000000");

        await sRip.rebase();
        expect(await sRip.balanceOf(initializer.address)).to.equal(afterRebase);
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("100000000000");

        const rebasedAmount = "1000000000";
        await sRip.transfer(bob.address, rebasedAmount); // Transfer rebased amount

        expect(await sRip.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sRip._agnosticBalance(initializer.address)).to.equal("99009900991");

        expect(await sRip.balanceOf(bob.address)).to.equal(Number(rebasedAmount) - 1); // Precision error ;(
        expect(await sRip._agnosticBalance(bob.address)).to.equal("990099009");
    });

    it("should drip funds to users", async () => {
        expect(await sRip.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);

        await sRip.drip();

        expect(await sRip.balanceOf(initializer.address)).to.equal("200000000000");
    });
});
