# Generated by Django 3.2.12 on 2024-01-20 13:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_auto_20240120_1034'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='supportedconversion',
            unique_together={('original_mimetype', 'target_mimetype')},
        ),
        migrations.RemoveField(
            model_name='supportedconversion',
            name='original_extension',
        ),
        migrations.RemoveField(
            model_name='supportedconversion',
            name='target_extension',
        ),
    ]
