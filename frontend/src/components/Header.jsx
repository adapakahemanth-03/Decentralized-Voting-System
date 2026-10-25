export default function Header() {
  return (
    <div className="header">
      <img
        src="/src/assets/election-symbol.png"
        alt=""
        className="header-img"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <h1 className="header-title">Election Voting System</h1>
    </div>
  );
}
