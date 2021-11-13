import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import readBarcode from "@salesforce/apex/barcodeScannerController.readBarcode";
import testExec from "@salesforce/apex/barcodeScannerController.testExec";
import myImages from "@salesforce/resourceUrl/images";

export default class MyBarcodeScanner extends LightningElement {
    myScanner;
    scanButtonDisabled = false;

    
    scannedBarcode = "1234";

    testValue1 = "hoge";
    HP = "-";
    ATK = "-";
    DEF = "-";

    IMAGE;
    COLOR;

    barcodeManualChange(event){
      this.scannedBarcode = event.target.value;
    }

    // When component is initialized, detect whether to enable Scan button
    connectedCallback() {
        this.myScanner = getBarcodeScanner();
        console.log("myScanner = ");
        console.log(this.myScanner);
        if (this.myScanner == null || !this.myScanner.isAvailable()) {
            this.scanButtonDisabled = true;
        }
    }

    createBattler(value) {
        console.log("createBattler start");
        readBarcode({ value: value }).then((result) => {
            console.log(result);
            this.testValue1 = result.testValue1;
            this.HP = result.HP;
            this.ATK = result.ATK;
            this.DEF = result.DEF;
            this.IMAGE = myImages + "/battler/" + result.IMAGE + ".png";
            this.COLOR = "color" + result.COLOR;
        });
    }

    testClick(event) {
        console.log("test start");
        this.createBattler(this.scannedBarcode);
        console.log("this.image1 = ");
        console.log(this.image1);
    }

    handleBeginScanClick(event) {
        // Reset scannedBarcode to empty string before starting new scan
        this.scannedBarcode = "";

        // Make sure BarcodeScanner is available before trying to use it
        // Note: We _also_ disable the Scan button if there's no BarcodeScanner
        if (this.myScanner != null && this.myScanner.isAvailable()) {
            const scanningOptions = {
                barcodeTypes: [
                    this.myScanner.barcodeTypes.CODE_128,
                    this.myScanner.barcodeTypes.CODE_39,
                    this.myScanner.barcodeTypes.CODE_93,
                    this.myScanner.barcodeTypes.DATA_MATRIX,
                    this.myScanner.barcodeTypes.EAN_13,
                    this.myScanner.barcodeTypes.EAN_8,
                    this.myScanner.barcodeTypes.ITF,
                    this.myScanner.barcodeTypes.PDF_417,
                    this.myScanner.barcodeTypes.QR,
                    this.myScanner.barcodeTypes.UPC_E
                ]
            };
            this.myScanner
                .beginCapture(scanningOptions)
                .then((result) => {
                    console.log(result);
                    this.scannedBarcode = decodeURIComponent(result.value);
                    this.createBattler(decodeURIComponent(result.value));
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Successful Scan",
                            message: "Barcode scanned successfully.!!!",
                            variant: "success"
                        })
                    );
                })
                .catch((error) => {
                    console.error(error);

                    // Handle unexpected errors here
                    // Inform the user we ran into something unexpected
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Barcode Scanner Error",
                            message:
                                "There was a problem scanning the barcode: " +
                                JSON.stringify(error) +
                                " Please try again.",
                            variant: "error",
                            mode: "sticky"
                        })
                    );
                })
                .finally(() => {
                    console.log("#finally");

                    // Clean up by ending capture,
                    // whether we completed successfully or had an error
                    this.myScanner.endCapture();
                });
        } else {
            // BarcodeScanner is not available
            // Not running on hardware with a camera, or some other context issue
            console.log(
                "Scan Barcode button should be disabled and unclickable."
            );
            console.log("Somehow it got clicked: ");
            console.log(event);

            // Let user know they need to use a mobile phone with a camera
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Barcode Scanner Is Not Available",
                    message:
                        "Try again from the Salesforce app on a mobile device.",
                    variant: "error"
                })
            );
        }
    }
}