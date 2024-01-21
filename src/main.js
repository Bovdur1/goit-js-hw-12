'use strict'

import axios from 'axios';
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector(".search-img-form");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
const loadMoreBtn = document.querySelector(".load-more-btn")

const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });

form.addEventListener("submit", submitFunction)
    
function searchParams(q, page) {
    const api = axios.create({
        baseURL: "https://pixabay.com/api/",
        params: {
            key: "41836139-8e3290e3b09a716b148135a6e",
            image_type: "photo",
            orientation: "horizontal",
            safesearch: true,
            q,
            page,
            per_page: 40,
        }
    })

    return api.get()
}

async function createRequest(query, page) {
    try {
        const response = await searchParams(query, page);

        if (response.data.totalHits === 0) {
            iziToast.error({
                message: "Sorry, there are no images matching your search query. Please try again!",
                position: "topRight"
            })

            loadMoreBtn.classList.add("is-hidden");
        }

        return response.data;
    
    } catch (error) {
        console.log(error);
    }

}

// Function for search form listener
let fetchImages = false;

function submitFunction(event) {
    event.preventDefault();
    gallery.innerHTML = '';
    const query = event.currentTarget.elements.search.value;
    loadMoreBtn.classList.add("is-hidden")
    let page = 1;
    
    if (fetchImages) {
        loadMoreBtn.removeEventListener("click", fetchImages);
        fetchImages = false;
    }
    
    if (query === "" || query === undefined) {
        iziToast.error({
            message: "Please, fill in the search field",
            position: "topRight"
        })
        return
    }

    fetchImages = async() => {
        try {
            loader.classList.remove("is-hidden");
            const response = await createRequest(query, page);
            page += 1;
            loader.classList.add("is-hidden");

            if (response.totalHits > 0) {
                galleryMarkup(response.hits);
                lightbox.refresh();
            }

            if (page > 1 && response.totalHits > 0) {
                loadMoreBtn.classList.remove("is-hidden");
            }

            return response

        } catch (error) {
            console.log(error);
        }

    }

    fetchImages()

    form.reset()

    loadMoreBtn.addEventListener("click", async () => { 
        loadMoreBtn.classList.add("is-hidden");

        const response = await fetchImages();

        const galleryItemRect = document.querySelector(".gallery-item").getBoundingClientRect();
        window.scrollBy({
            top: galleryItemRect.height * 2.0,
            left: 0,
            behavior: 'smooth',
        });

        if (page > (Math.ceil(response.totalHits / 40))) {
            setTimeout(() => {
                iziToast.info({
                    message: "We're sorry, but you've reached the end of search results.",
                    position: "topRight"
                })
            }, 1000);
            loadMoreBtn.classList.add("is-hidden");
        }
       
    })
}

//Create gallery markup
function galleryMarkup(images) {
    const markup = images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
        `<li class="gallery-item">
          <a class="gallery-link" href="${largeImageURL}">
            <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
            <div class="image-info">
              <p class="likes">Likes ${likes}</p>
              <p class="views">Views ${views}</p>
              <p class="comments">Comments ${comments}</p>
              <p class="downloas">Downloas ${downloads}</p>
            </div>
          </a>
        </li>`
    ).join("");

    gallery.insertAdjacentHTML("beforeend", markup)
}; 

