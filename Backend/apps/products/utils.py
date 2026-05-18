import random
import string

def generate_sku():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))