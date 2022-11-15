import Modal from "@mui/material/Modal";
import { useAppSelector } from "store/storeHooks";
import { ContainerModal, BackgroundModal } from "../style";
import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import TypeOfProblem from "./TypeOfProblem";
import { Box, Button, IconButton, Typography } from "@mui/material";
import Place from "./Place";
import CloseButton from "components/CloseButton";
import ReportForm from "./ReportForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useGetUserMutation } from "store/features/user/userApi";
import CircularProgress from '@mui/material/CircularProgress';
import StepReportHeader from "../components/StepReportHeader";

const StepByStepReport = () => {
  const showMap = useAppSelector((e) => e.map.showMap);

  return (
    <Modal
      hideBackdrop={false}
      open={true}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableScrollLock={false}
      hidden={showMap}
    >
      <BackgroundModal>
        <BodyModal />
      </BackgroundModal>
    </Modal>
  );
};

export interface IStepByStepReportContext {
  step: string;
  goTo(): void;
  goBack(): void;
  state: IInitialState;
  dispatch(value: ReducerAction): void;
  cacheForm(e: IFormReportState): void;
}

export const StepByStepReportContext =
  createContext<IStepByStepReportContext | null>(null);

interface IAddressForm {
  state: number;
  city: string;
  district: string;
  address: string;
}

interface IFormReportState {
  title: string,
  description: string,
  specificTypeOfProblem: string,
  imageSelected: string,
  anonymous: boolean
}

interface IInitialState {
  typeProblem_id: string | null;
  adressForm: null | IAddressForm;
  formReport: IFormReportState;
}

const inititialState = {
  typeProblem_id: null,
  adressForm: null,
  formReport: {
    title: "",
    description: "",
    specificTypeOfProblem: "",
    imageSelected: "",
    anonymous: false
  }
} as IInitialState;

export enum StepByStepReportReducer {
  ADD_TYPE_OF_PROBLEM_ID = "ADD_TYPE_OF_PROBLEM_ID",
  REMOVE_TYPE_OF_PROBLEM_ID = "REMOVE_TYPE_OF_PROBLEM_ID",
  ADD_ADDRESS_BY_FORM = "ADD_ADDRESS_BY_FORM",
  REMOVE_ADRESS = "REMOVE_ADRESS",
  SAVE_FORM = 'SAVE_FORM',
}

interface ReducerAction {
  type: StepByStepReportReducer;
  payload?: any;
}

const reducer = (prevState: IInitialState, action: ReducerAction) => {
  const { payload, type } = action;

  switch (type) {
    case StepByStepReportReducer.ADD_TYPE_OF_PROBLEM_ID:
      return { ...prevState, typeProblem_id: payload, formReport: { ...prevState.formReport, specificTypeOfProblem: "" } };
    case StepByStepReportReducer.REMOVE_TYPE_OF_PROBLEM_ID:
      return { ...prevState, typeProblem_id: null, formReport: { ...prevState.formReport, specificTypeOfProblem: "" } };
    case StepByStepReportReducer.ADD_ADDRESS_BY_FORM:
      const { address, city, district, state } = payload as IAddressForm;
      return { ...prevState, adressForm: { address, city, district, state } };
    case StepByStepReportReducer.REMOVE_ADRESS:
      return { ...prevState, adressForm: null };
    case StepByStepReportReducer.SAVE_FORM:
      return { ...prevState, formReport: payload };
    default:
      return prevState;
  }
};

const BodyModal = () => {
  const [step, setStep] = useState("TypeOfProblem");
  const [state, dispatchReport] = useReducer(reducer, inititialState);
  const [, { isLoading: isLoadingUser }] = useGetUserMutation({ fixedCacheKey: 'getUser' });
  const userToken = useAppSelector((e) => e.user.token);
  const navigate = useNavigate();

  const goTo = () => {
    if (step === "TypeOfProblem") {
      setStep("Place");
    } else if (step === "Place") {
      setStep("ReportForm");
    }
  };

  const cacheForm = (e: IFormReportState) => {
    dispatchReport({type: StepByStepReportReducer.SAVE_FORM, payload: e})
  }

  const goBack = () => {
    if (step === "Place") {
      setStep("TypeOfProblem");
    } else {
      setStep("Place");
    }
  };

  useEffect(() => {
    if (!userToken && !isLoadingUser) {
      console.log(userToken, isLoadingUser)

      navigate(`/login?path=formReport`, { replace: true });
    }
  }, [userToken, isLoadingUser])

  if (isLoadingUser) {
    return <ContainerModal><CircularProgress /></ContainerModal>
  }

  return (
    <ContainerModal>
      <StepByStepReportContext.Provider
        value={{ step, goTo, goBack, state, dispatch: dispatchReport, cacheForm }}
      >
        {step !== "ReportForm" && <StepReportHeader goBack={goBack}/>}

        {step === "TypeOfProblem" && <TypeOfProblem />}
        {step === "Place" && <Place />}
        {step === "ReportForm" && <ReportForm />}
      </StepByStepReportContext.Provider>
    </ContainerModal>
  );
};

export default StepByStepReport;
