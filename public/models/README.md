# 3D Models Directory

This directory contains 3D models used in the Medimap application.

## Human Anatomy Models

- `male-anatomy.glb` - Detailed male human anatomy model
- `female-anatomy.glb` - Detailed female human anatomy model

These models are used in the human-model component for visualizing human anatomy and selecting body parts for symptom selection.

## Model Acquisition Instructions

To complete the implementation of the 3D human model, you need to download or create appropriate GLTF models and place them in this directory.

### Option 1: Download Free Models

1. Visit one of these sources to find suitable human anatomy models:
   - [Sketchfab](https://sketchfab.com/search?q=human+anatomy&type=models) - Filter for models with appropriate licenses
   - [CGTrader](https://www.cgtrader.com/free-3d-models/character/anatomy) - Look for free anatomical models
   - [TurboSquid](https://www.turbosquid.com/Search/3D-Models/free/human-anatomy/gltf) - Search for free GLTF human models

2. Download the models in GLTF/GLB format

3. Rename the files to `male-anatomy.glb` and `female-anatomy.glb`

4. Place them in this directory

### Option 2: Use Khronos Group Sample Models

You can use the CesiumMan model from the Khronos Group's glTF Sample Models repository:

1. Download the CesiumMan.glb file from: 
   [https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF-Binary/CesiumMan.glb](https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/CesiumMan/glTF-Binary/CesiumMan.glb)

2. Rename it to `male-anatomy.glb`

3. Place it in this directory

4. Note: This model is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

### Option 3: Create Simple Models

If you can't find suitable models, you can create simple ones using Blender:

1. Download and install [Blender](https://www.blender.org/)

2. Create basic human models or use Blender's built-in human mesh generators

3. Export the models in GLB format

4. Name them `male-anatomy.glb` and `female-anatomy.glb`

5. Place them in this directory

### Note

The application includes a fallback to a simple geometric human model if the GLTF models are not available or fail to load.