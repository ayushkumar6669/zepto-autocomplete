import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

interface User {
  name: string;
  email: string;
}

interface UserWithColor extends User {
  bgColor?: string;
}

const ChipComponent: React.FC = () => {
  const mockUsers: User[] = [
    { name: "Nick Giannopoulos", email: "nick@example.com" },
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Doe", email: "jane@example.com" },
    { name: "Alice Smith", email: "alice@example.com" },
    { name: "Bob Johnson", email: "bob@example.com" },
  ];

  const [inputValue, setInputValue] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<UserWithColor[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [toRemoveIndex, setToRemoveIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArrowDown = () => {
    if (filteredUsers.length > 0) {
      setHighlightedIndex((prevIndex) => {
        const newIndex =
          prevIndex !== null
            ? Math.min(prevIndex + 1, filteredUsers.length - 1)
            : 0;
        return newIndex;
      });
    }
  };

  const handleArrowUp = () => {
    if (filteredUsers.length > 0) {
      setHighlightedIndex((prevIndex) => {
        const newIndex =
          prevIndex !== null
            ? Math.max(prevIndex - 1, 0)
            : filteredUsers.length - 1;
        return newIndex;
      });
    }
  };

  const handleEnterKey = () => {
    if (highlightedIndex !== null && filteredUsers.length > 0) {
      handleItemClick(filteredUsers[highlightedIndex]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        handleArrowDown();
        break;
      case "ArrowUp":
        handleArrowUp();
        break;
      case "Enter":
        handleEnterKey();
        break;
      default:
        break;
    }
  };

  const filterUsers = (query: string) => {
    setFilteredUsers(
      mockUsers.filter(
        (user) =>
          !selectedUsers.find(
            (selectedUser) => selectedUser.email === user.email
          ) &&
          (user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()))
      )
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    filterUsers(e.target.value);
  };

  const handleItemClick = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setInputValue("");
    setFilteredUsers([]);
  };

  const handleChipRemove = (removedUser: User) => {
    const updatedUsers = selectedUsers.filter(
      (user) => user.email !== removedUser.email
    );
    setSelectedUsers(updatedUsers);
    setFilteredUsers((prevFilteredUsers) => [
      ...prevFilteredUsers,
      removedUser,
    ]);
  };

  const handleBackspace = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      inputValue === "" &&
      selectedUsers.length > 0 &&
      e.key === "Backspace"
    ) {
      e.preventDefault();
      if (toRemoveIndex === null) {
        const lastUserIndex = selectedUsers.length - 1;
        const updatedUsers = selectedUsers.map((user, index) =>
          index === lastUserIndex ? { ...user, bgColor: "yellow" } : user
        );
        setSelectedUsers(updatedUsers);
        setToRemoveIndex(lastUserIndex);
      } else {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownPosition({ top: rect.bottom, left: rect.left - 200 });
          filterUsers(inputValue);
        }
        handleChipRemove(selectedUsers[toRemoveIndex]);
        setToRemoveIndex(null);
      }
    }
  };

  const handleInputClick = () => {
    setHighlightedIndex(null);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom, left: rect.left });
      filterUsers(inputValue);
    }
  };

  const handleDocumentClick = (e: MouseEvent) => {
    if (
      dropdownPosition &&
      e.target instanceof HTMLElement &&
      !inputRef.current?.contains(e.target)
    ) {
      setDropdownPosition(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom, left: rect.left });
    }
  }, [inputValue]);

  useEffect(() => {
    if (highlightedIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [highlightedIndex]);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          borderBottom: "2px solid blue",
          display: "flex",
          alignItems: "center",
          padding: "10px",
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {selectedUsers.map((user, index) => (
          <div
            key={index}
            className={`chip ${
              highlightedIndex === index ? "highlighted" : ""
            }`}
            style={{
              marginRight: "5px",
              display: "flex",
              alignItems: "center",
              backgroundColor: user.bgColor || "lightgrey",
              padding: "10px",
              borderRadius: "50px",
            }}
            onClick={() => setHighlightedIndex(index)}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                marginRight: "5px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-person"
                viewBox="0 0 16 16"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path
                  fillRule="evenodd"
                  d="M8 0a5.53 5.53 0 0 1 3.223 9.822c.05.14.1.308.1.478v.5a3 3 0 0 1-6 0v-.5c0-.17.05-.338.1-.478A5.53 5.53 0 0 1 8 0zM6.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"
                />
              </svg>
            </div>
            <span style={{ whiteSpace: "nowrap" }}>{user.name}</span>
            <span
              onClick={() => handleChipRemove(user)}
              style={{ marginLeft: "5px", cursor: "pointer" }}
            >
              X
            </span>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleBackspace}
          ref={inputRef}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: "10px 20px",
          }}
          onClick={handleInputClick}
        />
      </div>
      {dropdownPosition && (
        <div
          style={{
            position: "absolute",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: "auto",
            minWidth: "200px",
            backgroundColor: "white",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
            zIndex: 1,
          }}
        >
          {filteredUsers.length > 0 && (
            <div style={{ padding: "5px" }}>
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => handleItemClick(user)}
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    backgroundColor:
                      index === highlightedIndex ? "lightgray" : "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#4CAF50",
                      marginRight: "5px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-person"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      <path
                        fillRule="evenodd"
                        d="M8 0a5.53 5.53 0 0 1 3.223 9.822c.05.14.1.308.1.478v.5a3 3 0 0 1-6 0v-.5c0-.17.05-.338.1-.478A5.53 5.53 0 0 1 8 0zM6.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"
                      />
                    </svg>
                  </div>
                  <span>{user.name}</span>
                  <span style={{ fontSize: "10px", marginLeft: "10px" }}>
                    {user.email}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChipComponent;
