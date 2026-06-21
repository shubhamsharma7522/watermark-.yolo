from django.apps import AppConfig
import threading


class RemoverConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'remover'

    def ready(self):
        def _preload():
            try:
                from remover.utils import get_model
                get_model()
            except Exception:
                pass
        threading.Thread(target=_preload, daemon=True).start()
