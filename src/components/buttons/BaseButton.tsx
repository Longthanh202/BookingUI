import Button from "react-bootstrap/Button";

type ButtonProps = {
  title: string;
  onOk: () => void;
};

const BaseButton = ({ title, onOk }: ButtonProps) => {
  return (
    <Button variant="primary" onClick={onOk}>
      {title}
    </Button>
  );
};

export default BaseButton;
