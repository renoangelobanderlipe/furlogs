<?php

declare(strict_types=1);

test('health check returns ok', function () {
    $response = $this->getJson('/api/health');

    $response->assertOk()->assertJson(['status' => 'ok']);
});
