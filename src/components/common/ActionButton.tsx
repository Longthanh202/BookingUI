import Button from "react-bootstrap/Button";

type ButtonProps = {
  title: string;
  onOk: () => void;
};

const ActionButton = ({ title, onOk }: ButtonProps) => {
  return (
    <Button variant="primary" onClick={onOk}>
      {title}
    </Button>
  );
};

export default ActionButton;
