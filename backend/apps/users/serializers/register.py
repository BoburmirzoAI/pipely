from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.users.models import Role, User


class RegisterSerializer(serializers.Serializer):
    """Registration input.

    Built on the base ``Serializer`` (not ``ModelSerializer``) so every field,
    uniqueness rule and the create step is explicit and fully under our control.
    """

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        # Compare case-insensitively so "A@x.com" and "a@x.com" can't both exist.
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # create_user hashes the password (never stored in plain text).
        user = User.objects.create_user(**validated_data)
        # New users get the Sales role by default.
        sales = Role.objects.filter(name="Sales").first()
        if sales:
            user.roles.add(sales)
        return user
