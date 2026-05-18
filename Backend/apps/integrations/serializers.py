from rest_framework import serializers
from .models import *


class IntegrationConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationConfig
        fields = '__all__'


class APILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APILog
        fields = '__all__'