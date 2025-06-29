/**
 * Interface for the image data returned by the Picsum Photos API
 */
export interface ImageData {
  id: string;
  name: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

/**
 * Response type for fetchImages function
 */
export interface ImagesResponse {
  data?: ImageData[];
  error?: string;
}

/**
 * Fetches a list of images from the Picsum Photos API
 * @param page - The page number to fetch (default: 1)
 * @param limit - The number of images to fetch per page (default: 30)
 * @returns A promise that resolves to an ImagesResponse object containing either data or error
 */
export const fetchImages = async (page: number = 1, limit: number = 25): Promise<ImagesResponse> => {
  try {
    const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);

    if (!response.ok) {
      return { error: `Failed to fetch images: ${response.status} ${response.statusText}` };
    }

    const data: ImageData[] = await response.json();
    return { data };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
};

/**
 * Gets the image URL with specified dimensions
 * @param id - The image ID
 * @param width - The desired width
 * @param height - The desired height
 * @returns The URL for the image with the specified dimensions
 */
export const getImageUrl = (id: string, width: number, height: number): string => {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};
