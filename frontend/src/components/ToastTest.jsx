import toast from "react-hot-toast";

function ToastTest() {
  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2">
      <button
        onClick={() => toast.success("Success! This is a success message")}
        className="btn btn-success btn-sm"
      >
        Test Success Toast
      </button>
      <button
        onClick={() => toast.error("Error! This is an error message")}
        className="btn btn-error btn-sm"
      >
        Test Error Toast
      </button>
      <button
        onClick={() => toast("Info! This is an info message")}
        className="btn btn-info btn-sm"
      >
        Test Info Toast
      </button>
    </div>
  );
}

export default ToastTest;
