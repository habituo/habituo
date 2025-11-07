import PropTypes from "prop-types";
import {AreaModal, ConfirmationModal, CustomThemePanel, HabitModal, UserSettingsModal} from "../../../exports";

const LeftColumnModals = ({ modalsProps }) => {
  return (
    <>
      <HabitModal {...modalsProps.habit} />
      <AreaModal {...modalsProps.area} />
      <ConfirmationModal {...modalsProps.logout} />
      <ConfirmationModal {...modalsProps.deleteArea} />
      <UserSettingsModal {...modalsProps.profile} />
      <CustomThemePanel />
    </>
  );
};

LeftColumnModals.propTypes = {
  /** An object containing the specific props for each child modal. */
  modalsProps: PropTypes.shape({
    /** Props for the Habit modal (must include at least isOpen and onClose) */
    habit: PropTypes.object.isRequired,
    /** Props for the Area modal (must include at least isOpen and onClose) */
    area: PropTypes.object.isRequired,
    /** Props for the Logout Confirmation modal (must include at least isOpen, onClose, and onConfirm) */
    logout: PropTypes.object.isRequired,
    /** Props for the Delete Area Confirmation modal (must include at least isOpen, onClose, and onConfirm) */
    deleteArea: PropTypes.object.isRequired,
    /** Props for the Profile modal (must include at least isOpen, onClose, and tabs) */
    profile: PropTypes.object.isRequired,
  }).isRequired,
};

export default LeftColumnModals;
