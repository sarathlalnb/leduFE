const Input = ({ label, ...props }) => {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
      />
    </div>
  );
};

export default Input;