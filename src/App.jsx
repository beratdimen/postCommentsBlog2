import { useEffect, useRef } from "react";
import "./App.css";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

function App() {
  const [data, setData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [dark, setDark] = useState(
    () => localStorage.getItem("dark") === "true"
  );
  const dialogRef = useRef(false);
  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dark", dark);
  }, [dark]);

  useEffect(() => {
    async function getData() {
      const response = await fetch("http://localhost:3000/api/posts");
      const data = await response.json();
      setData(data);
      console.log(data);
    }
    getData();
  }, [refresh]);

  const handleNewPostForm = async (e) => {
    e.preventDefault();
    const formObj = Object.fromEntries(new FormData(e.target));
    console.log(formObj);
    const response = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formObj),
    });

    if (!response.ok) {
      return;
    }
    const data = await response.json();
    console.log(data);
    setRefresh(!refresh);
    e.target.reset();
    dialogRef.current.close();
  };

  const handleLikePostBtn = async (postId) => {
    const response = await fetch(
      `http://localhost:3000/api/posts/${postId}?like=true`
    );
    if (!response.ok) {
      return;
    }
    setRefresh(!refresh);
  };

  const handleLikeCommentBtn = async (commentId) => {
    const response = await fetch(
      `http://localhost:3000/api/comments/${commentId}?like=true`
    );
    if (!response.ok) {
      return;
    }
  };

  const customFormatDistanceToNow = (date) => {
    const distance = formatDistanceToNow(date, { addSuffix: true, locale: tr });
    return distance.replace("yaklaşık ", "");
  };

  const firstWordTitle = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const firstWord = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleShowCommentForm = (postId) => {
    setShowCommentForm(postId);
  };

  const handleAddNewCommentForm = async (e, postId) => {
    e.preventDefault();
    const formObj = Object.fromEntries(new FormData(e.target));

    const newComment = {
      ...formObj,
      postId: postId,
    };

    try {
      const response = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(newComment),
      });

      if (response.ok) {
        setRefresh(!refresh);
        formRef.current.reset();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const openModal = () => {
    dialogRef.current.showModal();
  };

  const closeModal = () => {
    dialogRef.current.close();
  };

  const [component, setComponent] = useState(
    <div className="cardBox">
      {data.map((x, i) => (
        <div className="card" key={i}>
          <div className="cardHeader">
            <div className="cardTitle">
              <img src="./img/man.png" alt="" />
              <p>{x.user.name}</p>
            </div>
            <p>
              {customFormatDistanceToNow(new Date(x.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>
          <h2>{firstWordTitle(x.title)}</h2>
          <p>{firstWord(x.content)}</p>

          <div className="btn">
            <button
              onClick={() => {
                handleLikePostBtn(x.id);
              }}
            >
              <img src="./img/like.svg" alt="" /> {x.likes}
            </button>
            <button onClick={() => handleShowCommentForm(x.id)}>
              <img src="./img/comment.svg" alt="" />
            </button>
            <button value={x.id} onClick={(e) => handleDetailPost(e)}>
              View Detail
            </button>
          </div>
          {showCommentForm === x.id && (
            <form
              ref={formRef}
              onSubmit={(e) => handleAddNewCommentForm(e, x.id)}
            >
              <textarea name="content" placeholder="Yorumunuz"></textarea>
              <button>Yorumu Gönder</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );

  const handleDetailPost = async (e) => {
    e.preventDefault();
    const postId = e.target.value;
    const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
    const posts = await response.json();
    setPosts(posts);
    console.log(postId);
    console.log(posts);
    setComponent(
      <div className={`detailContainer ${dark ? "detailContainerDark" : ""}`}>
        <div className="header">
          <h1>Postlar</h1>
          <div className="toogle">
            <img src="./img/light.svg" alt="Light Mode" />
            <label className="switch">
              <input type="checkbox" checked={dark} onChange={toggleDarkMode} />
              <span className="slider round"></span>
            </label>
            <img src="./img/dark.svg" alt="Dark Mode" />
          </div>
          <button
            onClick={() =>
              setComponent(
                <div className="cardBox">
                  {data.map((x, i) => (
                    <div className="card" key={i}>
                      <div className="cardHeader">
                        <div className="cardTitle">
                          <img src="./img/man.png" alt="" />
                          <p>{x.user.name}</p>
                        </div>
                        <p>
                          {customFormatDistanceToNow(new Date(x.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <h2>{firstWordTitle(x.title)}</h2>
                      <p>{firstWord(x.content)}</p>

                      <div className="btn">
                        <button
                          onClick={() => {
                            handleLikePostBtn(x.id);
                          }}
                        >
                          <img src="./img/like.svg" alt="" /> {x.likes}
                        </button>
                        <button onClick={() => handleShowCommentForm(x.id)}>
                          <img src="./img/comment.svg" alt="" />
                        </button>
                        <button
                          value={x.id}
                          onClick={(e) => handleDetailPost(e)}
                        >
                          View Detail
                        </button>
                      </div>
                      {showCommentForm === x.id && (
                        <form
                          ref={formRef}
                          onSubmit={(e) => handleAddNewCommentForm(e, x.id)}
                        >
                          <textarea
                            name="content"
                            placeholder="Yorumunuz"
                          ></textarea>
                          <button>Yorumu Gönder</button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          >
            geri
          </button>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">
              <img src="./img/man.png" alt="" />
              <p>{posts.user.name}</p>
            </div>
            <p>
              {customFormatDistanceToNow(new Date(posts.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>
          <h2>{firstWordTitle(posts.title)}</h2>
          <p>{firstWord(posts.content)}</p>

          {posts.comments.map((comment, i) => (
            <ul className="comments" key={i}>
              <li>{comment.content}</li>
              <div className="btn">
                <button
                  onClick={() => {
                    handleLikeCommentBtn(comment.id);
                  }}
                >
                  <img src="./img/like.svg" alt="" /> {comment.likes}
                </button>
              </div>
            </ul>
          ))}

          <div className="postDetailBtn">
            <button
              onClick={() => {
                handleLikePostBtn(posts.id);
              }}
            >
              <img src="./img/like.svg" alt="" /> {posts.likes}
            </button>
            <button onClick={() => handleShowCommentForm(comment.id)}>
              <img src="./img/comment.svg" alt="" />
            </button>
          </div>

          {showCommentForm === posts.id && (
            <form
              ref={formRef}
              onSubmit={(e) => handleAddNewCommentForm(e, posts.id)}
            >
              <textarea name="content" placeholder="Yorumunuz"></textarea>
              <button>Yorumu Gönder</button>
            </form>
          )}
        </div>
      </div>
    );
  };

  const toggleDarkMode = () => {
    setDark((prevMode) => !prevMode);
  };

  useEffect(() => {
    setComponent(
      <>
        <div className="header">
          <h1>Postlar</h1>
          <div className="toogle">
            <img src="./img/light.svg" alt="Light Mode" />
            <label className="switch">
              <input type="checkbox" checked={dark} onChange={toggleDarkMode} />
              <span className="slider round"></span>
            </label>
            <img src="./img/dark.svg" alt="Dark Mode" />
          </div>
          <button onClick={openModal}>
            Add Post <img src="./img/add-circle.svg" alt="" />
          </button>
        </div>
        <div className={`cardBox ${dark ? "cardBoxDark" : ""}`}>
          {data.map((x, i) => (
            <div className="card" key={i}>
              <div className="cardHeader">
                <div className="cardTitle">
                  <img src="./img/man.png" alt="" />
                  <p>{x.user.name}</p>
                </div>
                <p>
                  {customFormatDistanceToNow(new Date(x.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </p>
              </div>
              <h2>{firstWordTitle(x.title)}</h2>
              <p>{firstWord(x.content)}</p>

              <div className="btn">
                <button
                  onClick={() => {
                    handleLikePostBtn(x.id);
                  }}
                >
                  <img src="./img/like.svg" alt="" /> {x.likes}
                </button>
                <button onClick={() => handleShowCommentForm(x.id)}>
                  <img src="./img/comment.svg" alt="" />
                </button>
                <button value={x.id} onClick={(e) => handleDetailPost(e)}>
                  View Detail
                </button>
              </div>
              {showCommentForm === x.id && (
                <div className="formComment">
                  <form
                    ref={formRef}
                    onSubmit={(e) => handleAddNewCommentForm(e, x.id)}
                  >
                    <textarea
                      name="content"
                      placeholder="Enter Your Comment"
                      rows={4}
                    ></textarea>
                    <button>
                      Save <img src="./img/ok.svg" alt="" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  }, [data, showCommentForm]);

  return (
    <div className={`container ${dark ? "dark" : ""}`}>
      {component}

      <div className="dialogContainer">
        <dialog ref={(e) => (dialogRef.current = e)}>
          <div className="header">
            <h3>Fill in to add</h3>
            <button onClick={closeModal}>
              <img src="./img/close.png" alt="" />
            </button>
          </div>
          <form onSubmit={handleNewPostForm}>
            <div className="contentDialog">
              <input type="text" name="title" placeholder="Text Title" />
              <textarea
                name="content"
                placeholder="Text Content"
                rows={4}
              ></textarea>
            </div>
            <div className="btnDialog">
              <button>
                Save <img src="./img/ok.svg" alt="" />
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  );
}

export default App;
