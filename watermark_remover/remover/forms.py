from django import forms


class ImageUploadForm(forms.Form):
    """Form for uploading an image for watermark removal."""

    image = forms.ImageField(
        label="Select an image",
        help_text="Supported formats: JPG, JPEG, PNG, BMP, WEBP (max 10 MB)",
        widget=forms.ClearableFileInput(
            attrs={
                "accept": "image/jpeg,image/png,image/bmp,image/webp",
                "id": "id_image",
                "class": "d-none",  # hidden — we use a custom drag-drop UI
            }
        ),
    )

    def clean_image(self):
        image = self.cleaned_data.get("image")
        if image is None:
            raise forms.ValidationError("Please select an image to upload.")

        # Validate file size (10 MB)
        max_size = 10 * 1024 * 1024
        if image.size > max_size:
            raise forms.ValidationError(
                f"File too large ({image.size / (1024*1024):.1f} MB). "
                f"Maximum allowed is 10 MB."
            )

        # Validate content type
        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/bmp",
            "image/webp",
        ]
        if image.content_type not in allowed_types:
            raise forms.ValidationError(
                f"Unsupported file type: {image.content_type}. "
                f"Please upload a JPG, PNG, BMP, or WEBP image."
            )

        return image
