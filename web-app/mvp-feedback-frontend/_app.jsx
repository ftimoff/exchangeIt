import "../styles/globals.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Grommet,
  grommet,
  Layer,
  Text,
  Heading,
  ResponsiveContext,
} from "grommet";
import { Add, FormClose, StatusGood } from "grommet-icons";
import { Contract } from "@ethersproject/contracts";
import AppBar from "../modules/navigation/appBar";
import WalletButton from "../modules/navigation/walletButton";
import ListingNavButtons from "../modules/navigation/listingNavButtons";
import BottomTabNavigation from "../modules/navigation/bottomTabNavigation";
import LogoHeader from "../modules/navigation/logoHeader";
import { ProviderContext } from "../modules/hooks";
import BiconomyContext from "../modules/hooks/useBiconomy";
import ExchangeItGatewayContext from "../modules/hooks/useExchangeItGateway";
import ListingContext from "../modules/hooks/useListing";
import ToastContext from "../modules/hooks/useToast";
import { abis } from "../modules/contracts";
import SignerContext from "../modules/hooks/useSigner";
import { deepFreeze } from "grommet/utils";
import ModalContext from "../modules/hooks/useModal";

import { Biconomy } from "@biconomy/mexa";
import contractAddress from "../contracts/contract-address.json";

const ethers = require("ethers");

const getDefaultPageLayout = (page) => page;
const ONE_MINUTE = 60 * 1000;
const CF_UPDATE_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/updateLocation";

export const customTheme = deepFreeze({
  global: {
    colors: {
      //brand: "#7D4CDB",
      brand: "#475C7A",
      focus: "#685D79",
      selected: "#475C7A",
      "accent-1": "#685D79",
      "accent-2": "#AB6C82",
      "accent-3": "#D8737F",
      "accent-4": "#FCBB6D",
      "dark-1": "#344E5C",
    },
  },
  button: {
    borderRadius: 2,
    padding: {
      horizontal: "12px",
    },
  },
});

function MyApp({ Component, pageProps }) {
  // Allow us to render children pages
  const getPageLayout = Component.getLayout || getDefaultPageLayout;

  // Context
  const [provider, setProvider] = useState(null);
  const [biconomy, setBiconomy] = useState(null);
  const [exchangeItGateway, setExchangeItGateway] = useState(null);
  const [listing, setListing] = useState(null);
  const [toast, setToast] = useState(null);
  const [signer, setSigner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Values for Providers
  const providerValue = { provider, setProvider };
  const gatewayValue = { exchangeItGateway, setExchangeItGateway };
  const biconomyValue = { biconomy, setBiconomy };
  const listingValue = { listing, setListing };
  const signerValue = { signer, setSigner };
  const toastValue = { toast, setToast };
  const modalOpenValue = { modalOpen, setModalOpen };

  const [open, setOpen] = useState(false);
  const [toastTimeout, setToastTimeout] = useState();

  const [selectedAddress, setSelectedAddress] = useState(null);

  // Set the gateway when we load app
  useEffect(() => {
    if (provider === null) {
      return;
    }

    let config = {
      contract: {
       
        address: contractAddress.ExchangeItGateway,
        
        abi: abis.ExchangeItGateway.abi,
      },
      apiKey: {
        prod: "1d-vxq9Xv.1b135b9e-880a-4b3c-b7b5-c08b1f2bf0d0", // Exchangeit
      },
    };

    setExchangeItGateway(
      new Contract(
        config.contract.address,

        abis.ExchangeItGateway.abi,
        provider
      )
    );

    async function setupProviders() {
      setSigner(await provider.getSigner());
      let _providerAddress = await provider.getSigner().getAddress();
      console.log("address");
      console.log(_providerAddress);

      setSigner(await provider.getSigner());
   let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network/");

      const mbiconomy = new Biconomy(jsonRpcProvider, {
        walletProvider: provider.provider,
        apiKey: config.apiKey.prod,
        debug: true,
      });

      console.log("break1");
      mbiconomy
        .onEvent(mbiconomy.READY, async () => {
          const biconomyContract = new ethers.Contract(
            config.contract.address,
            config.contract.abi,
            await mbiconomy.getSignerByAddress(_providerAddress)
          );
          console.log("break2");

          setBiconomy({
            ...biconomy,
            _biconomy: mbiconomy,
            _contract: biconomyContract,
            _config: config,
          });

          console.log("break3");
        })
        .onEvent(mbiconomy.ERROR, (error, message) => {
          // Handle error while initializing mexa
          console.log(message);
          console.log(error);
        });
    }

    setupProviders();

    console.log("break4");
  }, [provider]);

  useEffect(() => {
    if (toast === null) {
      return;
    }
    setOpen(true);
    setToastTimeout(
      setTimeout(() => {
        setOpen(false);
        setToast(null);
      }, 3000)
    );
  }, [toast]);

  useEffect(() => {
    if (provider === null || provider === undefined) {
      return;
    }
    const signer = provider.getSigner();
    signer.getAddress().then((address) => {
      setSelectedAddress(address);
    });
  }, [provider]);

  useEffect(() => {
    if (
      navigator === null ||
      navigator === undefined ||
      selectedAddress === null
    ) {
      return;
    }
    // Create an interval to ping
    // const periodic = setInterval(() => {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     console.log(
    //       `User ${selectedAddress} Location ${position.coords.latitude} ${position.coords.longitude}`
    //     );
    //     const geoData = {
    //       userAddress: selectedAddress,
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //     };
    //     fetch(CF_UPDATE_URL, {
    //       method: "POST", // *GET, POST, PUT, DELETE, etc.
    //       mode: "no-cors",
    //       headers: {
    //         Accept: "application/json",
    //       },
    //       body: JSON.stringify(geoData),
    //     })
    //       .then((res) => {
    //         console.log(res);
    //       })
    //       .catch((e) => {
    //         console.log(e);
    //       });
    //   });
    // }, ONE_MINUTE);

    // return function cleanup() {
    //   clearInterval(periodic);
    // };
  }, [selectedAddress]);

  const onClose = () => {
    setOpen(false);
    clearTimeout(toastTimeout);
  };
  /*
  const styles={
    position:'fixed'
  };
*/

  return (
    <Grommet theme={customTheme} full>
      <Box fill>
        <ProviderContext.Provider value={providerValue}>
          <BiconomyContext.Provider value={biconomyValue}>
            <SignerContext.Provider value={signerValue}>
              <ExchangeItGatewayContext.Provider value={gatewayValue}>
                <ListingContext.Provider value={listingValue}>
                  <ModalContext.Provider value={modalOpenValue}>
                    <ToastContext.Provider value={toastValue}>
                      <ResponsiveContext.Consumer>
                        {(size) =>
                          size === "small" ? (
                            <Grid
                              columns={["1"]}
                              rows={["auto", "flex"]}
                              areas={[["header"], ["main"]]}
                              //areas={[["header"], ["main"], ["footer"]]}
                              gap="xxsmall"
                            >
                              <Box gridArea="header">
                                <AppBar>
                                  <LogoHeader />
                                </AppBar>
                              </Box>

                              <Box gridArea="main" margin="xsmall">
                                {getPageLayout(<Component {...pageProps} />)}
                              </Box>
                              {/*<BottomTabNavigation gridArea="footer" />*/}
                            </Grid>
                          ) : (
                            <Grid
                              columns={["1"]}
                              rows={["xsmall", "flex"]}
                              areas={[["header"], ["main"]]}
                              gap="xxsmall"
                            >
                              <Box>
                                <AppBar>
                                  <LogoHeader />
                                </AppBar>
                              </Box>
                              {/*<Box*/}
                              {/*  border={{ side: "bottom", color: "border" }}*/}
                              {/*  margin="none"*/}
                              {/*  pad="none"*/}
                              {/*  align="start"*/}
                              {/*  justify="start"*/}
                              {/*>*/}
                              {/*  <ListingNavButtons />*/}
                              {/*</Box>*/}
                              <Box fill flex data-testid="main-box">
                                {getPageLayout(<Component {...pageProps} />)}
                              </Box>
                            </Grid>
                          )
                        }
                      </ResponsiveContext.Consumer>

                      {open && (
                        <Layer
                          position="bottom"
                          modal={false}
                          margin={{ vertical: "xlarge", horizontal: "small" }}
                          onEsc={onClose}
                          responsive={false}
                          plain
                        >
                          <Box
                            align="center"
                            direction="row"
                            gap="small"
                            justify="between"
                            round="medium"
                            elevation="medium"
                            pad={{ vertical: "xsmall", horizontal: "small" }}
                            background={`status-${toast.status}`}
                          >
                            <Box align="center" direction="row" gap="xsmall">
                              <StatusGood />
                              <Text>{toast.message}</Text>
                            </Box>
                            <Button
                              icon={<FormClose />}
                              onClick={onClose}
                              plain
                            />
                          </Box>
                        </Layer>
                      )}
                    </ToastContext.Provider>
                  </ModalContext.Provider>
                </ListingContext.Provider>
              </ExchangeItGatewayContext.Provider>
            </SignerContext.Provider>
          </BiconomyContext.Provider>
        </ProviderContext.Provider>
      </Box>
    </Grommet>
  );
}

export default MyApp;
