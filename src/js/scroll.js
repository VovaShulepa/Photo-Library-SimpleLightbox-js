import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Api } from './api';
import creatCards from '../templates/card.hbs';

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');

const Pixabay = new Api();

// підключення бібліотеки
const lightbox = new SimpleLightbox('.gallery div', {
  sourceAttr: 'data-url',
  captionsData: 'alt',
  captionDelay: 250,
});

//SCROLL
const scroll = async event => {
  console.log(Pixabay.isNextDataExist());

  if (!Pixabay.isNextDataExist()) {
    observer.unobserve(document.querySelector('.target-element'));
    Notiflix.Notify.failure(
      "Were sorry, but you've reached the end of search results."
    );
    return;
  }

  Pixabay.page += 1;

  try {
    const response = await Pixabay.fetchPhotosByQuery();

    if (response.data.hits.length === 0) {
      observer.unobserve(document.querySelector('.target-element'));
      Notiflix.Notify.failure(
        "Were sorry, but you've reached the end of search results."
      );
    }

    galleryEl.insertAdjacentHTML('beforeend', creatCards(response.data.hits));
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }

  //   плавне прокручування
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

const observer = new IntersectionObserver(
  (entries, observer) => {
    if (entries[0].isIntersecting) {
      scroll();
    }
  },
  {
    root: null,
    rootMargin: '290px',
    threshold: 1,
  }
);

const onSearchFormSubmit = async event => {
  event.preventDefault();

  Pixabay.query = event.currentTarget.elements.searchQuery.value;
  Pixabay.page = 1;
  window.scrollTo({ top: 0 });

  try {
    const response = await Pixabay.fetchPhotosByQuery();

    Pixabay.totalHits = response.data.totalHits;

    if (response.data.total === 0) {
      event.target.elements.searchQuery.value = ' ';
      galleryEl.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }

    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );
    galleryEl.innerHTML = creatCards(response.data.hits);
    observer.observe(document.querySelector('.target-element'));
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure('Error');
  }
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
