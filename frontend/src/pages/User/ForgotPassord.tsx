import ForgotPasswordModal from '@/modal/forgotPasswordModal';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); 
  };

  return (
    <ForgotPasswordModal open={true} onClose={handleClose} />
  );
};

export default ForgotPasswordPage;
