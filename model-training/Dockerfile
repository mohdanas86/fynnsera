# Use an official Python runtime as a parent image.
FROM python:3.9-slim

# Set environment variables to prevent python from writing pyc files and enabling buffering
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install the dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the container
COPY . /app

# Expose the port your app runs on
EXPOSE 8080

# Command to run on container start
# CMD ["python", "app.py"]
# CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
CMD ["sh", "-c", "exec gunicorn -b 0.0.0.0:$PORT server:app"]


