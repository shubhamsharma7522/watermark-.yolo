# Watermark Remover

Watermark Remover is a Django-based web application that allows users to seamlessly remove watermarks from images. The project utilizes a fine-tuned **YOLO11x** model to detect watermarks and **OpenCV** inpainting algorithms to automatically reconstruct and remove them from the original image.

## Features
- **YOLO11x Object Detection**: Uses a fine-tuned YOLO11x model from the Ultralytics library to accurately detect watermark bounding boxes.
- **Image Inpainting**: Employs OpenCV's Telea inpainting algorithm to smoothly fill in detected watermark areas.
- **Web Interface**: Provides a user-friendly frontend to drag-and-drop or select images and process them on the fly.
- **RESTful API Endpoint**: Includes an endpoint for image processing logic.

## Requirements
The main dependencies are listed in `watermark_remover/requirements.txt`:
- Django >= 5.0
- OpenCV (headless)
- Ultralytics (YOLO)
- Pillow
- PyTorch
- NumPy

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd <repository_dir>
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r watermark_remover/requirements.txt
   ```

4. **Add the YOLO Model:**
   You must place your fine-tuned model (`best.pt`) in the `watermark_remover/models/` directory for detection to work. If `models/` directory does not exist, create it:
   ```bash
   mkdir -p watermark_remover/models/
   # Move or download best.pt into watermark_remover/models/
   ```
   *(Note: The `best.pt` file can typically be found in or trained via the `yolo11x_watermark_detection` repository/module, depending on your setup).*

5. **Run the server:**
   Navigate into the `watermark_remover` folder and start the Django development server:
   ```bash
   cd watermark_remover
   python manage.py runserver
   ```

6. **Access the application:**
   Open your browser and navigate to `http://127.0.0.1:8000/`.

## Project Structure

- **`watermark_remover/`**: The main Django project directory.
  - **`remover/`**: The Django application handling views, template rendering, and watermark removal API.
    - `utils.py`: Contains the YOLO model loading and OpenCV inpainting logic.
    - `views.py`: Defines the web rendering and API endpoints.
    - `templates/`: Contains HTML files, like `index.html`.
  - **`watermark_remover/`**: Configuration for Django (settings, urls).
  - **`models/`**: Expected location for the `best.pt` YOLO11x model weights.
  - **`media/`**: Directory where uploaded images and processed outputs are stored temporarily.
- **`yolo11x_watermark_detection/`**: Contains resources, configuration, or references to the fine-tuned model training (depending on upstream changes).
