import replicate
from dotenv import load_dotenv

load_dotenv()

try:
    # Open the local image file in binary read mode ("rb")
    with open("./imgs/library.jpg", "rb") as image_file:
        input_data = {
            "prompt": "Make the image in a dark night, the weather is snowy.",
            # Pass the file object directly
            "image_input": [image_file]
        }

        # Use the default client by calling replicate.run() directly
        output = replicate.run(
            "google/nano-banana", # Note: Make sure this model identifier is correct
            input=input_data
        )

    # The output is often a URL to the generated file
    print("Generated image URL:", output)

except FileNotFoundError:
    print("Error: The specified image file was not found. Please check the path.")
except Exception as e:
    print(f"An error occurred: {e}")