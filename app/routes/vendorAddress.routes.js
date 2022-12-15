import { checks } from "../middleware/index.js";
import { vendor_address_rules } from "../rules/vendorAddress.rules.js";
import { vendor_rules } from "../rules/vendors.rules.js";
import {
    addVendorAddress, getVendorAddress, rootGetVendorsAddress, rootGetVendorsAddressSpecifically, updateVendorAddress
} from "../controllers/vendorAddress.controller.js";

export default function (app) {
    app.get("/root/vendors/address", [checks.verifyKey, checks.isAdministratorKey], rootGetVendorsAddress);
    app.get("/root/vendors/address/via/vendor", [checks.verifyKey, checks.isAdministratorKey, vendor_rules.forFindingVendorAlt], rootGetVendorsAddressSpecifically);
    app.get("/root/vendors/address/via/city", [checks.verifyKey, checks.isAdministratorKey, vendor_address_rules.forFindingViaCity], rootGetVendorsAddressSpecifically);
    app.get("/root/vendors/address/via/state", [checks.verifyKey, checks.isAdministratorKey, vendor_address_rules.forFindingViaState], rootGetVendorsAddressSpecifically);
    app.get("/root/vendors/address/via/country", [checks.verifyKey, checks.isAdministratorKey, vendor_address_rules.forFindingViaCountry], rootGetVendorsAddressSpecifically);

    app.get("/vendors/address", [checks.verifyVendorUserToken, checks.isVendorUser], getVendorAddress);

    app.post("/vendors/address", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_address_rules.forAdding], addVendorAddress);

    app.put("/vendors/address", [checks.verifyVendorUserToken, checks.isVendorUser, vendor_address_rules.forUpdatingDetails], updateVendorAddress);
};
