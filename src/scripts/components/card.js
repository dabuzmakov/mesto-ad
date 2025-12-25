export const toggleLike = (likeButton, isLiked) => {
  likeButton.classList.toggle(
    "card__like-button_is-active",
    isLiked
  );
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
  userId,
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCountElement.textContent = data.likes.length;
  const isLiked = data.likes.some(user => user._id === userId);
  toggleLike(likeButton, isLiked);

  likeButton.addEventListener("click", () => {
    onLikeIcon(data, likeButton, likeCountElement);
  });

  infoButton.addEventListener("click", () => {
    onInfoClick(data._id);
  });

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  cardImage.addEventListener("click", () => {
    onPreviewPicture({ name: data.name, link: data.link });
  });

  return cardElement;
};
