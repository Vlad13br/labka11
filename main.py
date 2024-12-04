from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
app = Flask(__name__)
CORS(app, origins="*")

app.config['SECRET_KEY'] = 'secret_key'

# Функція для зчитування альбомів з файлу
def load_albums():
    if os.path.exists('data/albums.json'):
        with open('data/albums.json', 'r', encoding='utf-8') as json_file:
            return json.load(json_file)
    return []

# Функція для запису альбомів у файл
def save_albums(albums):
    os.makedirs('data', exist_ok=True)
    with open('data/albums.json', 'w', encoding='utf-8') as json_file:
        json.dump(albums, json_file, ensure_ascii=False, indent=4)

albums = load_albums()

# 1. Отримання всіх альбомів
@app.route('/api/albums', methods=['GET'])
def get_albums():
    return jsonify(albums)

# 2. Отримання альбому за ID
@app.route('/api/albums/<int:album_id>', methods=['GET'])
def get_album(album_id):
    album = None
    for a in albums:
        if a["id"] == album_id:
            album = a
            break
    if album:
        return jsonify(album)
    return jsonify({"error": "Album not found"}), 404

# 3. Створення нового альбому
@app.route('/api/albums', methods=['POST'])
def create_album():
    data = request.get_json()
    new_album = {
        "id": len(albums) + 1,
        "title": data.get('title'),
        "year": data.get('year'),
        "number_of_songs": data.get('number_of_songs'),
        "cover_image": data.get('cover_image'),
        "album_link": data.get('album_link')
    }
    albums.append(new_album)
    save_albums(albums)
    return jsonify(new_album), 201

# 4. Редагування альбому
@app.route('/api/albums/<int:album_id>', methods=['PUT'])
def update_album(album_id):
    data = request.get_json()
    album = None
    for a in albums:
        if a["id"] == album_id:
            album = a
            break
    if album:
        album["title"] = data.get('title', album["title"])
        album["year"] = data.get('year', album["year"])
        save_albums(albums)
        return jsonify(album), 200
    return jsonify({"error": "Album not found"}), 404

# 5. Видалення альбому за ID
@app.route('/api/albums/<int:album_id>', methods=['DELETE'])
def delete_album(album_id):
    global albums
    album_to_delete = None
    for album in albums:
        if album["id"] == album_id:
            album_to_delete = album
            break

    if album_to_delete:
        albums.remove(album_to_delete)
        save_albums(albums)
        return jsonify({"message": "Album deleted successfully"}), 200

    return jsonify({"error": "Album not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)

