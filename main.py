import jwt
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 
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

# Функція для зчитування користувачів з файлу
def load_users():
    if os.path.exists('data/users.json'):
        with open('data/users.json', 'r', encoding='utf-8') as json_file:
            return json.load(json_file)
    return []

# Функція для запису користувачів у файл
def save_users(users):
    os.makedirs('data', exist_ok=True)
    with open('data/users.json', 'w', encoding='utf-8') as json_file:
        json.dump(users, json_file, ensure_ascii=False, indent=4)

albums = load_albums()
users = load_users()

# Функція для перевірки JWT
def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]  # Bearer <token>

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            # Перевірка і декодування токену
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = None
            for u in users:
                if u['id'] == data['user_id']:
                    current_user = u
                    break
            if not current_user:
                raise Exception("User not found.")
        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired!'}), 401

        return f(current_user, *args, **kwargs)

    return decorator

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
    print(data)

    number_of_songs = int(data.get('number_of_songs', 0))

    max_id = max((album["id"] for album in albums), default=0)

    new_album = {
        "id": max_id + 1,
        "title": data.get('title'),
        "release_date": data.get('year'),
        "number_of_songs": number_of_songs,
        "cover_image": data.get('cover_image'),
        "album_link": data.get('album_link'),
        "tracks": [
            {
                "id": i + 1,
                "title": f"Song {i + 1}",
                "duration": "0:00"
            }
            for i in range(number_of_songs)
        ]
    }

    albums.append(new_album)
    save_albums(albums)

    return jsonify(new_album), 201

# 4. Редагування альбому
@app.route('/api/albums/<int:album_id>', methods=['PUT'])
def update_album(album_id):
    data = request.get_json()
    print(data)
    album = None
    for a in albums:
        if a["id"] == album_id:
            album = a
            break
    if album:
        album["title"] = data.get('title', album["title"])
        album["release_date"] = data.get('release_date', album["release_date"])
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

# 6. Реєстрація нового користувача
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email та пароль є обов'язковими"}), 400

    for user in users:
        if user['email'] == email:
            return jsonify({"error": "Email вже використовується"}), 400

    hashed_password = generate_password_hash(password)

    new_user = {
        "id": len(users) + 1,
        "email": email,
        "password": hashed_password
    }
    users.append(new_user)
    save_users(users)
    return jsonify({"message": "Користувача успішно зареєстровано"}), 201

# 7. Логін користувача
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email та пароль є обов'язковими"}), 400

    user = None
    for u in users:
        if u['email'] == email:
            user = u
            break

    if user and check_password_hash(user['password'], password):
        # Генерація JWT
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({"message": "Логін успішний", "token": token}), 200
    return jsonify({"error": "Невірний email або пароль"}), 401

@app.route('/api/check_session', methods=['GET'])
@token_required  # Перевірка авторизації
def check_session(current_user):
    return jsonify({"message": "Користувач автентифікований", "user_id": current_user['id']}), 200

# Вихід користувача
@app.route('/api/logout', methods=['POST'])
def logout_user():
    return jsonify({"message": "Вихід успішний"}), 200

if __name__ == "__main__":
    app.run(debug=True)
